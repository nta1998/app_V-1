import {
  View,
  Text,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useMemo, useRef } from 'react';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useApi } from '../../hooks/useApi';
import { projectsApi, apartmentsApi, type Project, type Apartment } from '../../services/api';
import { CONTACT_PHONE } from '../../constants/config';
import CTAFooter from '../../components/CTAFooter';
import FloatingBackButton from '../../components/FloatingBackButton';
import GlassSection from '../../components/GlassSection';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 374;

export default function ProjectDetailScreen() {
  const { mode, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [descExpanded, setDescExpanded] = useState(false);
  const [showAllApartments, setShowAllApartments] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const heroScale = scrollY.interpolate({
    inputRange: [-300, 0],
    outputRange: [2.5, 1],
    extrapolateRight: 'clamp',
  });
  const heroTranslateY = scrollY.interpolate({
    inputRange: [-300, 0],
    outputRange: [-150, 0],
    extrapolateRight: 'clamp',
  });

  const projectId = Number(id);

  const { state: projectState } = useApi(
    () => projectsApi.get(projectId),
    [projectId]
  );
  const { state: apartmentsState } = useApi(
    () => apartmentsApi.list(projectId),
    [projectId]
  );

  const handleCall = () => {
    Linking.openURL(`tel:${CONTACT_PHONE}`);
  };

  const handleWhatsApp = () => {
    const number = CONTACT_PHONE.replace('+', '');
    Linking.openURL(`https://wa.me/${number}`).catch(() =>
      Alert.alert('שגיאה', 'לא ניתן לפתוח WhatsApp')
    );
  };

  if (projectState.status === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={[colors.bgDeep, colors.bgDark]} style={StyleSheet.absoluteFill} />
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (projectState.status === 'error' || projectState.status === 'idle') {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={[colors.bgDeep, colors.bgDark]} style={StyleSheet.absoluteFill} />
        <Ionicons name="alert-circle-outline" size={40} color={colors.primary} />
        <Text style={styles.errorText}>לא ניתן לטעון את הפרויקט</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryText}>חזור</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const project: Project = projectState.data;
  const apartments: Apartment[] =
    apartmentsState.status === 'success' ? apartmentsState.data : [];

  const descText = project.project_description ?? '';
  const shortDesc = descText.length > 150 ? descText.slice(0, 150) + '...' : descText;

  const specs = [
    { label: 'דירות', value: String(apartments.length), icon: 'business-outline' as const },
    { label: 'מסמכים', value: String(project.documents.length), icon: 'document-outline' as const },
    { label: 'שנה', value: '2025', icon: 'calendar-outline' as const },
    { label: 'התקדמות', value: `${project.percentage}%`, icon: 'stats-chart-outline' as const },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.bgDeep, colors.bgDark]} style={StyleSheet.absoluteFill} />

      <Animated.ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 93 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        bounces={true}
        overScrollMode="never"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Animated.View style={{
            width: '100%',
            height: HERO_HEIGHT,
            transform: [{ scale: heroScale }, { translateY: heroTranslateY }],
          }}>
            {project.project_image_url ? (
              <Image
                source={{ uri: project.project_image_url }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={['#1a2a1a', '#2a3a2a', '#1a1a2a']}
                style={styles.heroImage}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.heroDecor}>
                  <Ionicons name="business" size={80} color="rgba(200,164,85,0.15)" />
                </View>
              </LinearGradient>
            )}
          </Animated.View>

          {/* Floating Info Card */}
          <View style={styles.heroInfoCard}>
            <BlurView intensity={30} tint={mode === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            <View style={styles.heroInfoContent}>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>{project.type ?? 'פרויקט'}</Text>
              </View>
              <Text style={styles.heroTitle}>{project.title}</Text>
              <View style={styles.locationRow}>
                <Text style={styles.locationText}>{project.project_address}</Text>
                <Ionicons name="location-outline" size={14} color={colors.primary} />
              </View>
              <View style={styles.heroProgressBar}>
                <View
                  style={[
                    styles.heroProgressFill,
                    { width: `${Math.min(project.percentage, 100)}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bodyContent}>
          {/* Overview Section */}
          {descText.length > 0 && (
            <GlassSection title="סקירה כללית">
              <Text style={styles.descriptionText}>
                {descExpanded ? descText : shortDesc}
              </Text>
              {descText.length > 150 && (
                <TouchableOpacity
                  style={styles.expandRow}
                  onPress={() => setDescExpanded(!descExpanded)}
                >
                  <Ionicons
                    name={descExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.expandText}>{descExpanded ? 'הסתר' : 'קרא עוד'}</Text>
                </TouchableOpacity>
              )}
            </GlassSection>
          )}

          {/* Specs Section */}
          <GlassSection title="פרטי הפרויקט">
            <View style={styles.specsGrid}>
              {specs.map((spec, i) => (
                <View key={i} style={styles.specItem}>
                  <Ionicons name={spec.icon} size={22} color={colors.primary} />
                  <Text style={styles.specValue}>{spec.value}</Text>
                  <Text style={styles.specLabel}>{spec.label}</Text>
                </View>
              ))}
            </View>
          </GlassSection>

          {/* Documents Section */}
          {project.documents.length > 0 && (
            <GlassSection title="מסמכי הפרויקט">
              {project.documents.map((doc) => (
                <TouchableOpacity
                  key={doc.id}
                  style={styles.docItem}
                  onPress={() => Linking.openURL(doc.file)}
                >
                  <Ionicons name="open-outline" size={16} color={colors.primary} />
                  <View style={styles.docInfo}>
                    <Text style={styles.docTitle}>{doc.title}</Text>
                    <Text style={styles.docType}>{doc.doc_type}</Text>
                  </View>
                  <Ionicons name="document-text-outline" size={20} color={colors.textWhite50} />
                </TouchableOpacity>
              ))}
            </GlassSection>
          )}

          {/* Units Section */}
          {(apartments.length > 0 || apartmentsState.status === 'loading') && (
            <View style={styles.glassCard}>
              <View style={styles.unitsTitleRow}>
                {apartments.length > 3 && (
                  <TouchableOpacity onPress={() => setShowAllApartments(!showAllApartments)}>
                    <Text style={styles.showAllText}>{showAllApartments ? 'הצג פחות' : 'הצג הכל'}</Text>
                  </TouchableOpacity>
                )}
                <View style={styles.unitsTitleRight}>
                  {apartments.length > 0 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{apartments.length}</Text>
                    </View>
                  )}
                  <Text style={styles.sectionTitle}>דירות זמינות</Text>
                  <View style={styles.goldIndicator} />
                </View>
              </View>

              {apartmentsState.status === 'loading' ? (
                <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
              ) : (
                (showAllApartments ? apartments : apartments.slice(0, 3)).map((apt) => (
                  <ApartmentCard key={apt.id} apartment={apt} />
                ))
              )}
            </View>
          )}
        </View>
      </Animated.ScrollView>

      <FloatingBackButton />
      <CTAFooter onCall={handleCall} onWhatsApp={handleWhatsApp} />
    </View>
  );
}

function ApartmentCard({ apartment }: { apartment: Apartment }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const priceNum = apartment.price ? parseFloat(apartment.price) : null;
  const priceDisplay = priceNum
    ? `₪${priceNum.toLocaleString('he-IL')}`
    : 'מחיר לפי פנייה';

  const detailParts = [
    apartment.number_of_rooms != null ? `${apartment.number_of_rooms} חד'` : null,
    apartment.apartment_size_sqm != null ? `${apartment.apartment_size_sqm} מ"ר` : null,
    apartment.floor != null ? `קומה ${apartment.floor}` : null,
  ].filter(Boolean);

  return (
    <TouchableOpacity
      style={styles.apartmentCard}
      onPress={() => router.push(`/apartment/${apartment.id}`)}
      activeOpacity={0.75}
    >
      {apartment.main_image ? (
        <Image
          source={{ uri: apartment.main_image }}
          style={styles.apartmentImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.apartmentImagePlaceholder}>
          <Ionicons name="home" size={24} color={colors.primary} />
        </View>
      )}
      <View style={styles.apartmentInfo}>
        <Text style={styles.apartmentName} numberOfLines={2}>{apartment.apartment_specific_address}</Text>
        <Text style={styles.apartmentDetails} numberOfLines={1}>{detailParts.join(' | ')}</Text>
        <Text style={styles.apartmentPrice}>{priceDisplay}</Text>
      </View>
      {apartment.type && (
        <View style={styles.apartmentTypeBadge}>
          <Text style={styles.apartmentTypeText}>{apartment.type}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDeep },
  scrollContent: { flexGrow: 1 },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: colors.bgDeep,
  },
  errorText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 16,
    color: colors.textWhite70,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: { fontFamily: Fonts.manrope.bold, fontSize: 14, color: colors.bgDark },

  // Hero
  heroContainer: { height: HERO_HEIGHT, position: 'relative' },
  heroImage: { width: '100%', height: HERO_HEIGHT },
  heroDecor: { position: 'absolute', bottom: 80, right: 30, opacity: 0.5 },
  // backButton styles moved to FloatingBackButton component
  heroInfoCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  heroInfoContent: { padding: 16, alignItems: 'flex-end' },
  newBadge: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
    alignSelf: 'flex-end',
  },
  newBadgeText: { fontFamily: Fonts.manrope.bold, fontSize: 12, color: colors.bgDark },
  heroTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 20,
    color: colors.textWhite,
    textAlign: 'right',
    marginBottom: 6,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  locationText: { fontFamily: Fonts.heebo.regular, fontSize: 13, color: colors.textWhite70 },
  heroProgressBar: {
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  heroProgressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },

  // Body
  bodyContent: { paddingTop: 20, paddingHorizontal: 20, gap: 16 },
  // Used by Units section (has custom header with count badge)
  glassCard: {
    backgroundColor: colors.glass20,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 16,
    color: colors.textWhite,
    textAlign: 'right',
  },
  goldIndicator: { width: 3, height: 18, backgroundColor: colors.primary, borderRadius: 2 },

  // Overview
  descriptionText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 14,
    color: colors.textWhite70,
    textAlign: 'right',
    lineHeight: 22,
  },
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 10,
  },
  expandText: { fontFamily: Fonts.manrope.semiBold, fontSize: 13, color: colors.primary },

  // Specs
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  specItem: {
    flexBasis: '48%',
    flexGrow: 1,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  specValue: {
    fontFamily: Fonts.spaceGrotesk.bold,
    fontSize: 20,
    color: colors.textWhite,
    textAlign: 'center',
  },
  specLabel: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 12,
    color: colors.textWhite50,
    textAlign: 'center',
  },

  // Documents
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  docInfo: { flex: 1, alignItems: 'flex-end' },
  docTitle: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 13,
    color: colors.textWhite,
    textAlign: 'right',
  },
  docType: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 11,
    color: colors.textWhite50,
    textAlign: 'right',
  },

  // Units
  unitsTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  unitsTitleRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  countBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countBadgeText: { fontFamily: Fonts.manrope.bold, fontSize: 12, color: colors.bgDark },
  showAllText: { fontFamily: Fonts.manrope.semiBold, fontSize: 13, color: colors.primary },
  apartmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  apartmentImage: { width: 66, height: 66, borderRadius: 12 },
  apartmentImagePlaceholder: {
    width: 66,
    height: 66,
    borderRadius: 12,
    backgroundColor: 'rgba(200,164,85,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  apartmentInfo: { flex: 1, alignItems: 'flex-end' },
  apartmentName: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 14,
    color: colors.textWhite,
    textAlign: 'right',
    marginBottom: 2,
  },
  apartmentDetails: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 12,
    color: colors.textWhite50,
    textAlign: 'right',
    marginBottom: 4,
  },
  apartmentPrice: {
    fontFamily: Fonts.spaceGrotesk.bold,
    fontSize: 14,
    color: colors.primary,
  },
  apartmentTypeBadge: {
    backgroundColor: 'rgba(200,164,85,0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  apartmentTypeText: {
    fontFamily: Fonts.manrope.semiBold,
    fontSize: 11,
    color: colors.primary,
  },

  // CTA Bar styles moved to CTAFooter component
});
