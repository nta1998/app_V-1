import { useMemo, useRef } from 'react';
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
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useApi } from '../../hooks/useApi';
import { apartmentsApi, type Apartment } from '../../services/api';
import { CONTACT_PHONE } from '../../constants/config';
import CTAFooter from '../../components/CTAFooter';
import FloatingBackButton from '../../components/FloatingBackButton';
import GlassSection from '../../components/GlassSection';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 385;

interface FeatureTile {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}

export default function ApartmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { mode, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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

  const aptId = Number(id);

  const { state: aptState } = useApi(() => apartmentsApi.get(aptId), [aptId]);

  const handleCall = () => {
    Linking.openURL(`tel:${CONTACT_PHONE}`);
  };

  const handleWhatsApp = () => {
    const number = CONTACT_PHONE.replace('+', '');
    Linking.openURL(`https://wa.me/${number}`).catch(() =>
      Alert.alert('שגיאה', 'לא ניתן לפתוח WhatsApp')
    );
  };

  const handleShare = async (apt: Apartment) => {
    try {
      await Share.share({
        message: `${apt.apartment_specific_address} — ${apt.project.title}`,
      });
    } catch {
      // ignore
    }
  };

  if (aptState.status === 'loading' || aptState.status === 'idle') {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={[colors.bgDeep, colors.bgDark]} style={StyleSheet.absoluteFill} />
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (aptState.status === 'error') {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={[colors.bgDeep, colors.bgDark]} style={StyleSheet.absoluteFill} />
        <Ionicons name="alert-circle-outline" size={40} color={colors.primary} />
        <Text style={styles.errorText}>לא ניתן לטעון את הדירה</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryText}>חזור</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const apt: Apartment = aptState.data;
  const priceNum = apt.price ? parseFloat(apt.price) : null;
  const priceDisplay = priceNum ? `₪${priceNum.toLocaleString('he-IL')}` : 'מחיר לפי פנייה';

  const features: FeatureTile[] = [
    apt.number_of_rooms != null
      ? { icon: 'bed-outline', label: 'חדרים', value: String(apt.number_of_rooms) }
      : null,
    apt.apartment_size_sqm != null
      ? { icon: 'resize-outline', label: 'שטח', value: `${apt.apartment_size_sqm} מ"ר` }
      : null,
    apt.floor != null
      ? { icon: 'layers-outline', label: 'קומה', value: String(apt.floor) }
      : null,
    apt.balcony_size_sqm != null
      ? { icon: 'sunny-outline', label: 'מרפסת', value: `${apt.balcony_size_sqm} מ"ר` }
      : null,
    apt.parking != null
      ? { icon: 'car-outline', label: 'חניה', value: apt.parking }
      : null,
    apt.air_directions != null
      ? { icon: 'compass-outline', label: 'כיווני אוויר', value: apt.air_directions }
      : null,
    apt.entry_date
      ? { icon: 'calendar-outline', label: 'תאריך כניסה', value: apt.entry_date }
      : null,
    apt.neighborhood
      ? { icon: 'map-outline', label: 'שכונה', value: apt.neighborhood }
      : null,
    apt.facade
      ? { icon: 'home-outline', label: 'חזית', value: apt.facade }
      : null,
    apt.bank_escort
      ? { icon: 'shield-checkmark-outline', label: 'ליווי בנקאי', value: 'כן' }
      : null,
  ].filter((f): f is FeatureTile => f !== null);

  const hasFeatures = features.length > 0;
  const hasDescription = !!apt.description;
  const heroUri = apt.main_image ?? apt.apartment_image_url;

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
        {/* Hero */}
        <View style={styles.heroContainer}>
          <Animated.View style={{
            width: '100%',
            height: HERO_HEIGHT,
            transform: [{ scale: heroScale }, { translateY: heroTranslateY }],
          }}>
            {heroUri ? (
              <Image source={{ uri: heroUri }} style={styles.heroImage} resizeMode="cover" />
            ) : (
              <LinearGradient
                colors={['#1a1a2e', '#2a1a2e', '#1a2e1a']}
                style={styles.heroImage}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.heroPlaceholderIcon}>
                  <Ionicons name="home" size={72} color="rgba(200,164,85,0.18)" />
                </View>
              </LinearGradient>
            )}
          </Animated.View>

          {/* gradient scrim at bottom of hero */}
          <LinearGradient
            colors={['transparent', 'rgba(14,13,7,0.85)']}
            style={styles.heroScrim}
          />

          {/* Floating Info Card */}
          <View style={styles.heroInfoCard}>
            <BlurView intensity={30} tint={mode === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            <View style={styles.heroInfoContent}>
              <View style={styles.projectRowWithBadge}>
                {apt.type && (
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{apt.type}</Text>
                  </View>
                )}
                <View style={styles.projectRow}>
                  <Text style={styles.projectName}>{apt.project.title}</Text>
                  <Ionicons name="business-outline" size={14} color={colors.primary} />
                </View>
              </View>
              <Text style={styles.aptName}>{apt.apartment_specific_address}</Text>
              {priceNum && (
                <Text style={styles.heroPrice}>{priceDisplay}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.bodyContent}>

          {/* Description / General Overview */}
          {hasDescription && (
            <View style={styles.glassCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>סקירה כללית</Text>
                <View style={styles.goldIndicator} />
              </View>
              <Text style={styles.descriptionText}>{apt.description}</Text>
            </View>
          )}

          {/* Apartment Details — price + features */}
          <View style={styles.glassCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>פרטי הדירה</Text>
              <View style={styles.goldIndicator} />
            </View>

            {/* Price row */}
            <View style={styles.priceRow}>
              <Text style={styles.price}>{priceDisplay}</Text>
              <View style={styles.priceIconCircle}>
                <Ionicons name="cash-outline" size={18} color={colors.primary} />
              </View>
            </View>

            {/* Features grid */}
            {hasFeatures && (
              <View style={styles.featuresGrid}>
                {features.map((f, i) => (
                  <View key={i} style={styles.featureTile}>
                    <Ionicons name={f.icon} size={22} color={colors.primary} />
                    <Text style={styles.featureValue}>{f.value}</Text>
                    <Text style={styles.featureLabel}>{f.label}</Text>
                  </View>
                ))}
              </View>
            )}

          </View>

          {/* Documents */}
          {apt.documents.length > 0 && (
            <View style={styles.glassCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>מסמכים על הדירה</Text>
                <View style={styles.goldIndicator} />
              </View>
              {apt.documents.map((doc) => (
                <TouchableOpacity
                  key={doc.id}
                  style={styles.docItem}
                  onPress={() => Linking.openURL(doc.file)}
                >
                  <Ionicons name="open-outline" size={16} color={colors.primary} />
                  <Text style={styles.docLabel}>{doc.doc_type}</Text>
                  <Ionicons name="document-text-outline" size={20} color={colors.textWhite50} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </Animated.ScrollView>

      <FloatingBackButton />
      <FloatingBackButton side="right" icon="share-outline" onPress={() => handleShare(apt)} />
      <CTAFooter onCall={handleCall} onWhatsApp={handleWhatsApp} />
    </View>
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
  heroPlaceholderIcon: {
    position: 'absolute',
    bottom: 80,
    left: '50%',
    transform: [{ translateX: -36 }],
  },
  heroScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  floatingBackButton: { position: 'absolute', left: 16, zIndex: 10 },
  floatingShareButton: { position: 'absolute', right: 16, zIndex: 10 },
  circleAction: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Floating info card (inside hero)
  heroInfoCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  heroInfoContent: { padding: 12, alignItems: 'flex-end' },
  projectRowWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  typeBadge: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeBadgeText: { fontFamily: Fonts.manrope.bold, fontSize: 11, color: colors.bgDark },
  aptName: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 17,
    color: colors.textWhite,
    textAlign: 'right',
    marginBottom: 2,
  },
  projectRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroPrice: {
    fontFamily: Fonts.spaceGrotesk.bold,
    fontSize: 17,
    color: colors.primary,
    textAlign: 'right',
  },

  // Body
  bodyContent: { paddingTop: 20, paddingHorizontal: 16, gap: 16 },
  projectName: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 13,
    color: colors.textWhite50,
    textAlign: 'right',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  priceIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(200,164,85,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  price: {
    fontFamily: Fonts.spaceGrotesk.bold,
    fontSize: 22,
    color: colors.primary,
    textAlign: 'right',
  },

  // Glass card
  glassCard: {
    backgroundColor: colors.glass20,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginBottom: 14,
  },
  goldIndicator: { width: 3, height: 18, backgroundColor: colors.primary, borderRadius: 2 },
  sectionTitle: {
    fontFamily: Fonts.manrope.bold,
    fontSize: 16,
    color: colors.textWhite,
    textAlign: 'right',
  },

  // Features grid (3 columns)
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featureTile: {
    flexBasis: '30%',
    flexGrow: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  featureValue: {
    fontFamily: Fonts.spaceGrotesk.bold,
    fontSize: 15,
    color: colors.textWhite,
    textAlign: 'center',
  },
  featureLabel: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 11,
    color: colors.textWhite50,
    textAlign: 'center',
  },

  // Description
  descriptionText: {
    fontFamily: Fonts.heebo.regular,
    fontSize: 14,
    color: colors.textWhite70,
    textAlign: 'right',
    lineHeight: 22,
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
  docLabel: {
    flex: 1,
    fontFamily: Fonts.heebo.regular,
    fontSize: 13,
    color: colors.textWhite70,
    textAlign: 'right',
  },

  // CTA Bar
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    overflow: 'hidden',
  },
  ctaRow: { flexDirection: 'row', gap: 12 },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 52,
    gap: 8,
  },
  callText: { fontFamily: Fonts.manrope.bold, fontSize: 15, color: colors.bgDark },
  whatsappButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass20,
    borderRadius: 14,
    height: 52,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  whatsappText: { fontFamily: Fonts.manrope.bold, fontSize: 15, color: colors.textWhite },
});
