import { useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, type ThemeColors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

const { width } = Dimensions.get('window');

const MILESTONES = [
  {
    year: '2010',
    title: 'הקמת החברה',
    desc: 'ציון לילוז מתחיל את דרכו בתחום שיווק נדל״ן ומקים את החברה.',
  },
  {
    year: '2015',
    title: 'התרחבות למגדלי יוקרה',
    desc: 'ניהול מערכות שיווק ומכירה לפרויקטי מגורים ומגדלי יוקרה.',
  },
  {
    year: '2019',
    title: 'פיתוח שיטת 360°',
    desc: 'השקת המתודולוגיה הייחודית לשיווק פרויקטים למגורים.',
  },
  {
    year: 'היום',
    title: 'מובילי שוק הנדל״ן',
    desc: 'ליווי יזמים בתל אביב וגוש דן עם תוצאות יוצאות דופן.',
    isToday: true,
  },
];

const HERO_HEIGHT = 600;

export default function AboutScreen() {
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
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
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
              source={require('../../assets/images/profile-photo.jpg')}
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
        <View style={styles.aboutPanelWrapper}>
          <BlurView intensity={24} tint={mode === 'dark' ? 'dark' : 'light'} style={styles.aboutPanel}>
            {/* Gold gradient line at top */}
            <LinearGradient
              colors={['#c8a455', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.aboutGoldLine}
            />

            <View style={styles.aboutPanelContent}>
              <Text style={styles.aboutTitle}>אודותיי</Text>
              <Text style={styles.aboutText}>
                שמי ציון לילוז, בן 54, עוסק בתחום שיווק נדל״ן משנת 2010. אני
                מלווה יזמים בכל שלבי הפרויקט: ניתוח כלכלי, תמחור ובדיקת כדאיות
                כלכלית, תכנון, מיתוג, שיווק ומכירה.
              </Text>

              {/* CTA Buttons */}
              <View style={styles.ctaRow}>
                <TouchableOpacity
                  style={styles.phoneButton}
                  onPress={handlePhone}
                  activeOpacity={0.85}
                >
                  <Ionicons name="call" size={16} color={colors.bgDark} />
                  <Text style={styles.ctaTextDark}>חייג עכשיו</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.whatsappButton}
                  onPress={handleWhatsApp}
                  activeOpacity={0.85}
                >
                  <Ionicons name="chatbubble-ellipses" size={16} color={colors.bgDeep} />
                  <Text style={styles.ctaTextDark}>וואטסאפ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>

        {/* ===== 3. שיטת 360° SECTION ===== */}
        <View style={styles.methodSection}>
          <Text style={styles.methodTitle}>שיטת 360°</Text>
          <Text style={styles.methodDesc}>
            השיטה שפיתחתי לשיווק פרויקטים למגורים, המשלבת אסטרטגיה, שיווק
            וטכנולוגיה לתוצאות מקסימליות.
          </Text>

          {/* 360° Circular Diagram */}
          <View style={styles.diagramContainer}>
            {/* Dashed circle */}
            <View style={styles.dashedCircle} />
            {/* Pulse circle */}
            <View style={styles.pulseCircle} />
            {/* Center badge */}
            <View style={styles.centerBadge}>
              <Text style={styles.centerBadgeText}>360°</Text>
            </View>

            {/* Orbital elements */}
            <View style={[styles.orbitalItem, styles.orbitalTop]}>
              <Text style={styles.orbitalText}>אסטרטגיה</Text>
            </View>
            <View style={[styles.orbitalItem, styles.orbitalLeft]}>
              <Text style={styles.orbitalText}>שיווק</Text>
            </View>
            <View style={[styles.orbitalItem, styles.orbitalRight]}>
              <Text style={[styles.orbitalText, { fontSize: 13 }]}>
                טכנולוגיה
              </Text>
            </View>
            <View style={[styles.orbitalItem, styles.orbitalBottom]}>
              <Text style={styles.orbitalText}>תוצאות</Text>
            </View>
          </View>

          {/* Quote Card */}
          <View style={styles.quoteCard}>
            <Text style={styles.quoteText}>
              אני מאמין שהאנרגיה הגבוהה והדיוק בהם אני מפעיל את שיווק הפרויקט
              ומערך המכירות מביאים אותנו לתוצאות יוצאות דופן. המכירות שלנו
              מנוהלות בעזרת מערכת מתקדמת המאפשרת לנו לשלוט ולנהל את כל מקורות
              המידע.
            </Text>
          </View>
        </View>

        {/* ===== 4. ציוני דרך SECTION ===== */}
        <View style={styles.milestonesSection}>
          <Text style={styles.milestonesSubtitle}>הדרך שלנו</Text>
          <Text style={styles.milestonesTitle}>ציוני דרך</Text>

          <View style={styles.timelineContainer}>
            {/* Gold gradient line on RIGHT side */}
            <LinearGradient
              colors={['#c8a455', '#c8a45500']}
              style={styles.timelineLine}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />

            {MILESTONES.map((m, i) => {
              const yOffset = i * 135;
              return (
                <View key={i} style={styles.milestoneRow}>
                  {/* Content card on the LEFT */}
                  <View
                    style={[
                      styles.milestoneCard,
                      m.isToday && styles.milestoneCardToday,
                    ]}
                  >
                    <Text style={styles.milestoneCardTitle}>{m.title}</Text>
                    <Text style={styles.milestoneCardDesc}>{m.desc}</Text>
                  </View>

                  {/* Year label to LEFT of dot */}
                  <Text style={styles.milestoneYear}>{m.year}</Text>

                  {/* Dot on the RIGHT */}
                  {m.isToday ? (
                    <View style={styles.milestoneDiamond}>
                      <Ionicons name="diamond" size={14} color={colors.bgDark} />
                    </View>
                  ) : (
                    <View style={styles.milestoneDot}>
                      <View style={styles.milestoneDotInner} />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgDark,
    },
    scrollContent: {
      flexGrow: 1,
    },

    // ========== HERO ==========
    hero: {
      height: HERO_HEIGHT,
      width: '100%',
      position: 'relative',
    },
    heroImage: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: '#00000040',
    },
    heroGradientBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 300,
    },
    heroContent: {
      position: 'absolute',
      bottom: 80,
      left: 0,
      right: 0,
      alignItems: 'flex-end',
      paddingHorizontal: 20,
      gap: 8,
    },
    heroName: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 28,
      color: colors.textWhite,
    },
    roleBadge: {
      backgroundColor: colors.glass20,
      borderWidth: 1,
      borderColor: colors.borderLight,
      borderRadius: 12,
      paddingVertical: 6,
      paddingHorizontal: 14,
    },
    roleBadgeText: {
      fontFamily: Fonts.heebo.regular,
      fontSize: 12,
      color: colors.textWhite,
    },
    // ========== ABOUT PANEL ==========
    aboutPanelWrapper: {
      marginTop: -60,
      paddingHorizontal: 20,
      zIndex: 10,
    },
    aboutPanel: {
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderMedium,
    },
    aboutPanelContent: {
      backgroundColor: colors.glass20,
      padding: 20,
      paddingTop: 16,
      gap: 12,
    },
    aboutGoldLine: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 2,
    },
    aboutTitle: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 18,
      color: colors.textWhite,
      textAlign: 'right',
    },
    aboutText: {
      fontFamily: Fonts.heebo.regular,
      fontSize: 14,
      color: colors.textWhite,
      textAlign: 'right',
      lineHeight: 14 * 1.6,
    },
    ctaRow: {
      flexDirection: 'row',
      gap: 10,
    },
    phoneButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#c8a455',
      borderRadius: 14,
      height: 44,
      gap: 8,
    },
    whatsappButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#25D366',
      borderRadius: 14,
      height: 44,
      gap: 8,
    },
    ctaTextDark: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 13,
      color: colors.textWhite,
    },

    // ========== METHOD 360° ==========
    methodSection: {
      backgroundColor: colors.bgDark,
      paddingVertical: 24,
      paddingHorizontal: 20,
      gap: 20,
    },
    methodTitle: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 20,
      color: colors.textWhite,
      textAlign: 'center',
    },
    methodDesc: {
      fontFamily: Fonts.heebo.regular,
      fontSize: 14,
      color: colors.textWhite70,
      textAlign: 'center',
      lineHeight: 14 * 1.6,
    },

    // 360° Diagram
    diagramContainer: {
      width: 250,
      height: 250,
      alignSelf: 'center',
      position: 'relative',
    },
    dashedCircle: {
      position: 'absolute',
      width: 220,
      height: 220,
      borderRadius: 110,
      borderWidth: 1,
      borderColor: '#c8a45530',
      borderStyle: 'dashed',
      top: 15,
      left: 15,
    },
    pulseCircle: {
      position: 'absolute',
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: '#c8a45510',
      borderWidth: 1,
      borderColor: '#c8a45520',
      top: 35,
      left: 35,
    },
    centerBadge: {
      position: 'absolute',
      width: 74,
      height: 74,
      borderRadius: 37,
      backgroundColor: '#C8A455',
      top: 88,
      left: 88,
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerBadgeText: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 20,
      color: colors.bgDark,
    },

    // Orbital items
    orbitalItem: {
      position: 'absolute',
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.glass20,
      borderWidth: 1,
      borderColor: colors.borderLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    orbitalTop: {
      left: 85,
      top: 0,
    },
    orbitalLeft: {
      left: 0,
      top: 85,
    },
    orbitalRight: {
      left: 170,
      top: 85,
    },
    orbitalBottom: {
      left: 85,
      top: 170,
    },
    orbitalText: {
      fontFamily: Fonts.heebo.medium,
      fontSize: 14,
      color: colors.textWhite,
      textAlign: 'center',
    },

    // Quote Card
    quoteCard: {
      backgroundColor: colors.glass20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderLight,
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    quoteText: {
      fontFamily: Fonts.heebo.regular,
      fontSize: 14,
      lineHeight: 14 * 1.6,
      color: colors.textWhite70,
      textAlign: 'right',
    },

    // ========== MILESTONES ==========
    milestonesSection: {
      backgroundColor: colors.bgDark,
      paddingTop: 0,
      paddingHorizontal: 20,
      paddingBottom: 20,
      gap: 16,
    },
    milestonesSubtitle: {
      fontFamily: Fonts.heebo.medium,
      fontSize: 13,
      color: '#c8a455',
      textAlign: 'right',
      letterSpacing: 1,
    },
    milestonesTitle: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 22,
      color: colors.textWhite,
      textAlign: 'right',
    },

    // Timeline
    timelineContainer: {
      position: 'relative',
      minHeight: 540,
    },
    timelineLine: {
      position: 'absolute',
      right: 7,
      top: 0,
      width: 2,
      height: 540,
    },

    // Milestone row
    milestoneRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 24,
    },
    milestoneCard: {
      flex: 1,
      backgroundColor: colors.glass20,
      borderWidth: 1,
      borderColor: colors.borderLight,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginRight: 12,
      gap: 6,
    },
    milestoneCardToday: {
      borderColor: '#c8a4554D',
      backgroundColor: colors.glass20,
    },
    milestoneCardTitle: {
      fontFamily: Fonts.heebo.bold,
      fontSize: 15,
      color: colors.textWhite,
      textAlign: 'right',
    },
    milestoneCardDesc: {
      fontFamily: Fonts.heebo.regular,
      fontSize: 13,
      color: colors.textWhite70,
      textAlign: 'right',
      lineHeight: 13 * 1.5,
    },
    milestoneYear: {
      fontFamily: Fonts.manrope.bold,
      fontSize: 14,
      color: '#c8a455',
      width: 40,
      textAlign: 'center',
      marginTop: 4,
    },
    milestoneDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: '#c8a45530',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
    },
    milestoneDotInner: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#c8a455',
    },
    milestoneDiamond: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#c8a455',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
    },
    milestoneDiamondInner: {
      width: 14,
      height: 14,
    },
  });
