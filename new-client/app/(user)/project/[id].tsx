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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useMemo } from 'react';
import { useTheme } from '../../../hooks/useTheme';
import { makeStyles } from './styles/projectDetail.styles';
import { useParallaxScroll } from '../../../hooks/useParallaxScroll';
import { useApi } from '../../../hooks/useApi';
import { projectsApi, apartmentsApi, type Project, type Apartment } from '../../../services/api';
import { CONTACT_PHONE } from '../../../constants/config';
import CTAFooter from '../../../components/CTAFooter';
import FloatingBackButton from '../../../components/FloatingBackButton';
import GlassSection from '../../../components/GlassSection';
import ProjectHeroInfoCard from '../../../components/ProjectDetail/ProjectHeroInfoCard';
import SpecGridItem from '../../../components/ProjectDetail/SpecGridItem';
import ApartmentCard from '../../../components/ProjectDetail/ApartmentCard';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 374;

export default function ProjectDetailScreen() {
  const { mode, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [descExpanded, setDescExpanded] = useState(false);
  const [showAllApartments, setShowAllApartments] = useState(false);
  const { scrollY, heroScale, heroTranslateY, onScroll } = useParallaxScroll();

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
        onScroll={onScroll}
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

          <ProjectHeroInfoCard
            type={project.type ?? null}
            title={project.title}
            address={project.project_address}
            percentage={project.percentage}
          />
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
                <SpecGridItem key={i} icon={spec.icon} value={spec.value} label={spec.label} />
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

