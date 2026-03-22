import { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Linking,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { makeStyles } from './styles/about.styles';
import { useTheme } from '../../../hooks/useTheme';
import { useParallaxScroll } from '../../../hooks/useParallaxScroll';
import AboutPanel from '../../../components/About/AboutPanel';
import MethodDiagram from '../../../components/About/MethodDiagram';
import QuoteCard from '../../../components/About/QuoteCard';
import MilestoneTimeline from '../../../components/About/MilestoneTimeline';

export default function AboutScreen() {
  const { mode, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { scrollY, heroScale, heroTranslateY, onScroll } = useParallaxScroll();

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/97231234567');
  };

  const handlePhone = () => {
    Linking.openURL('tel:031234567');
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        bounces={true}
        overScrollMode="never"
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* ===== 1. HERO SECTION ===== */}
        <View style={styles.hero}>
          {/* Hero background image */}
          <Animated.View style={{
            ...StyleSheet.absoluteFillObject,
            transform: [{ scale: heroScale }, { translateY: heroTranslateY }],
          }}>
            <Image
              source={require('../../../assets/images/profile-photo.jpg')}
              style={styles.heroImage}
              resizeMode="cover"
            />
            {/* Hero overlay */}
            <View style={styles.heroOverlay} />
            {/* Hero gradient fade to bg at bottom */}
            <LinearGradient
              colors={['transparent', colors.bgDark]}
              style={styles.heroGradientBottom}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          </Animated.View>

          {/* Hero content — bottom right */}
          <View style={styles.heroContent}>
            <Text style={styles.heroName}>ציון לילוז</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                מנכ״ל ובעלים | מומחה נדל״ן יוקרה
              </Text>
            </View>
          </View>

        </View>

        {/* ===== 2. GLASS PANEL "אודותיי" ===== */}
        <AboutPanel onPhone={handlePhone} onWhatsApp={handleWhatsApp} />

        {/* ===== 3. שיטת 360° SECTION + Quote ===== */}
        <MethodDiagram />
        <View style={styles.quoteWrapper}>
          <QuoteCard />
        </View>

        {/* ===== 4. ציוני דרך SECTION ===== */}
        <MilestoneTimeline />

        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
}
