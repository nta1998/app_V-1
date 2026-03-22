import { useMemo } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../../hooks/useTheme';
import { makeStyles } from './styles/apartmentDetail.styles';
import { useParallaxScroll } from '../../../hooks/useParallaxScroll';
import { useApi } from '../../../hooks/useApi';
import { apartmentsApi, type Apartment } from '../../../services/api';
import { CONTACT_PHONE } from '../../../constants/config';
import CTAFooter from '../../../components/CTAFooter';
import FloatingBackButton from '../../../components/FloatingBackButton';
import ApartmentInfoCard from '../../../components/ApartmentDetail/ApartmentInfoCard';
import FeaturesGrid from '../../../components/ApartmentDetail/FeaturesGrid';

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

  const { scrollY, heroScale, heroTranslateY, onScroll } = useParallaxScroll();

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
        onScroll={onScroll}
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

          <ApartmentInfoCard
            address={apt.apartment_specific_address}
            projectTitle={apt.project.title}
            type={apt.type ?? null}
            price={apt.price}
          />
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
            <FeaturesGrid features={features} />

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
