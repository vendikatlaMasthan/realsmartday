import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { CircularActionButton } from '../components/ui/CircularActionButton';
import {
  conversionPresets,
  mockRecentConversions,
  ConversionPreset,
  RecentConversion,
} from '../data/mockConverter';

export interface FileConverterScreenProps {
  onBack: () => void;
}

export const FileConverterScreen: React.FC<FileConverterScreenProps> = ({
  onBack,
}) => {
  const { theme, isDark } = useTheme();
  const { colors, typography, spacing, borderRadius } = theme;
  const insets = useSafeAreaInsets();

  const [selectedPreset, setSelectedPreset] = useState<ConversionPreset>(
    conversionPresets[0]
  );
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Ready to convert');
  const [recents, setRecents] = useState<RecentConversion[]>(mockRecentConversions);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(
    'Quarterly_Mobile_Roadmap.pdf'
  );

  const startMockConversion = () => {
    if (isConverting) return;
    setIsConverting(true);
    setConversionProgress(15);
    setStatusMessage('Parsing document structure...');

    setTimeout(() => {
      setConversionProgress(45);
      setStatusMessage('Applying AI OCR and layout optimization...');
    }, 1000);

    setTimeout(() => {
      setConversionProgress(80);
      setStatusMessage('Compiling target output buffer...');
    }, 2000);

    setTimeout(() => {
      setConversionProgress(100);
      setStatusMessage('Conversion complete!');
      setIsConverting(false);

      const newConverted: RecentConversion = {
        id: `rc-${Date.now()}`,
        fileName: uploadedFileName || 'Document.pdf',
        originalSize: '3.4 MB',
        convertedSize: '950 KB',
        fromType: selectedPreset.sourceFormat,
        toType: selectedPreset.targetFormat,
        timestamp: 'Just now',
        status: 'completed',
      };
      setRecents([newConverted, ...recents]);
    }, 3000);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.md,
            paddingHorizontal: spacing.base + 4,
            paddingBottom: spacing.base,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
          },
        ]}
      >
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            {
              fontSize: typography.sizes.lg,
              fontWeight: typography.weights.bold,
              color: colors.textPrimary,
            },
          ]}
        >
          Universal Converter
        </Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.body,
          {
            paddingHorizontal: spacing.base + 4,
            paddingTop: spacing.lg,
            paddingBottom: insets.bottom + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Upload Zone */}
        <TouchableOpacity
          onPress={() => {
            setUploadedFileName('Q3_Platform_Specification.pdf');
          }}
          activeOpacity={0.8}
          style={[
            styles.uploadZone,
            {
              backgroundColor: colors.surface,
              borderColor: colors.primaryLight,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderRadius: borderRadius['2xl'],
              padding: spacing.xl,
              marginBottom: spacing.xl,
            },
          ]}
        >
          <View
            style={[
              styles.uploadIconCircle,
              {
                backgroundColor: colors.primarySurface,
                borderRadius: borderRadius.full,
                marginBottom: spacing.md,
              },
            ]}
          >
            <Ionicons
              name="cloud-upload-outline"
              size={32}
              color={colors.primaryLight}
            />
          </View>

          <Text
            style={[
              styles.uploadMainText,
              {
                fontSize: typography.sizes.base,
                fontWeight: typography.weights.bold,
                color: colors.textPrimary,
                textAlign: 'center',
              },
            ]}
          >
            {uploadedFileName ? uploadedFileName : 'Tap to select or drop document'}
          </Text>

          <Text
            style={[
              styles.uploadSubText,
              {
                fontSize: typography.sizes.xs,
                color: colors.textSecondary,
                textAlign: 'center',
                marginTop: 4,
              },
            ]}
          >
            Supports PDF, DOCX, PNG, WEBP, M4A, CSV (up to 100MB)
          </Text>

          {uploadedFileName && (
            <View
              style={[
                styles.fileSelectedBadge,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderRadius: borderRadius.full,
                  paddingHorizontal: spacing.md,
                  paddingVertical: 4,
                  marginTop: spacing.md,
                },
              ]}
            >
              <Ionicons
                name="document-attach"
                size={14}
                color={colors.success}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.badgeText,
                  {
                    fontSize: typography.sizes.xs,
                    color: colors.success,
                    fontWeight: typography.weights.semibold,
                  },
                ]}
              >
                File Loaded • 3.4 MB
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Format Presets */}
        <SectionHeader title="Conversion Presets" />
        <View style={[styles.presetsGrid, { marginBottom: spacing.xl }]}>
          {conversionPresets.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <TouchableOpacity
                key={preset.id}
                onPress={() => setSelectedPreset(preset)}
                activeOpacity={0.8}
                style={[
                  styles.presetCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isSelected ? colors.primaryLight : colors.border,
                    borderWidth: isSelected ? 1.8 : 1,
                    borderRadius: borderRadius.xl,
                    padding: spacing.md,
                  },
                  theme.shadows.sm,
                ]}
              >
                <View style={styles.presetTop}>
                  <Ionicons
                    name={preset.icon as any}
                    size={20}
                    color={isSelected ? colors.primaryLight : colors.textSecondary}
                  />
                  {preset.badge && (
                    <Badge label={preset.badge} variant="ai" size="sm" />
                  )}
                </View>

                <View style={styles.formatRow}>
                  <Text
                    style={[
                      styles.formatFrom,
                      {
                        fontSize: typography.sizes.sm,
                        fontWeight: typography.weights.bold,
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    {preset.sourceFormat}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={12}
                    color={colors.textTertiary}
                    style={{ marginHorizontal: 4 }}
                  />
                  <Text
                    style={[
                      styles.formatTo,
                      {
                        fontSize: typography.sizes.sm,
                        fontWeight: typography.weights.bold,
                        color: colors.primaryLight,
                      },
                    ]}
                  >
                    {preset.targetFormat}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Progress & Convert Button */}
        {isConverting && (
          <View
            style={[
              styles.progressCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: borderRadius.xl,
                padding: spacing.base,
                marginBottom: spacing.xl,
              },
            ]}
          >
            <View style={styles.progressHeader}>
              <Text
                style={[
                  styles.progressTitle,
                  {
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.weights.semibold,
                    color: colors.textPrimary,
                  },
                ]}
              >
                {statusMessage}
              </Text>
              <Text
                style={[
                  styles.progressPct,
                  {
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.weights.bold,
                    color: colors.primaryLight,
                  },
                ]}
              >
                {conversionProgress}%
              </Text>
            </View>

            <View
              style={[
                styles.track,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderRadius: borderRadius.full,
                  marginVertical: spacing.sm,
                },
              ]}
            >
              <View
                style={[
                  styles.fill,
                  {
                    width: `${conversionProgress}%`,
                    backgroundColor: colors.primaryLight,
                    borderRadius: borderRadius.full,
                  },
                ]}
              />
            </View>
          </View>
        )}


        {/* 3-sub-cards: From / To / Status */}
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            marginBottom: spacing.xl,
            marginTop: spacing.sm,
          }}
        >
          {[
            {
              icon: 'document-outline' as keyof typeof Ionicons.glyphMap,
              label: 'From',
              value: selectedPreset.sourceFormat,
              color: colors.textSecondary,
            },
            {
              icon: 'swap-horizontal-outline' as keyof typeof Ionicons.glyphMap,
              label: 'To',
              value: selectedPreset.targetFormat,
              color: colors.primaryLight,
            },
            {
              icon: isConverting
                ? ('sync-outline' as keyof typeof Ionicons.glyphMap)
                : conversionProgress === 100
                ? ('checkmark-circle-outline' as keyof typeof Ionicons.glyphMap)
                : ('hourglass-outline' as keyof typeof Ionicons.glyphMap),
              label: 'Status',
              value: isConverting
                ? `${conversionProgress}%`
                : conversionProgress === 100
                ? 'Done'
                : 'Ready',
              color: isConverting
                ? colors.warning
                : conversionProgress === 100
                ? colors.success
                : colors.textSecondary,
            },
          ].map((card, idx) => (
            <View
              key={idx}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: borderRadius.xl,
                padding: spacing.md,
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Ionicons name={card.icon} size={22} color={card.color} />
              <Text
                style={{
                  fontSize: 10,
                  color: colors.textTertiary,
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  marginTop: 2,
                }}
              >
                {card.label}
              </Text>
              <Text
                style={{
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.extrabold,
                  color: colors.textPrimary,
                  letterSpacing: -0.3,
                }}
              >
                {card.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Circular Convert Button */}
        <View style={{ alignItems: 'center', marginBottom: spacing['2xl'] }}>
          <CircularActionButton
            label={isConverting ? 'Converting...' : `Convert to ${selectedPreset.targetFormat}`}
            iconName={isConverting ? 'sync-outline' : 'swap-horizontal'}
            onPress={startMockConversion}
            disabled={isConverting}
            size={80}
          />
        </View>


        {/* Recent Conversions */}
        <SectionHeader title="Recent Conversions" badge={recents.length} />
        {recents.map((item) => (
          <View
            key={item.id}
            style={[
              styles.recentCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: borderRadius.xl,
                padding: spacing.base,
                marginBottom: spacing.md,
              },
              theme.shadows.sm,
            ]}
          >
            <View style={styles.recentRow}>
              <View
                style={[
                  styles.docIcon,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderRadius: borderRadius.lg,
                  },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={colors.primaryLight}
                />
              </View>

              <View style={styles.recentInfo}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.recentName,
                    {
                      fontSize: typography.sizes.sm + 1,
                      fontWeight: typography.weights.semibold,
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  {item.fileName}
                </Text>
                <Text
                  style={[
                    styles.recentMeta,
                    {
                      fontSize: typography.sizes.xs,
                      color: colors.textSecondary,
                      marginTop: 2,
                    },
                  ]}
                >
                  {item.fromType} → {item.toType} • {item.convertedSize} (saved 65%)
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setDownloadedId(item.id);
                  setTimeout(() => setDownloadedId(null), 1600);
                }}
                activeOpacity={0.75}
                style={[
                  styles.downloadBtn,
                  {
                    backgroundColor:
                      downloadedId === item.id
                        ? colors.successSurface
                        : colors.primarySurface,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Ionicons
                  name={
                    downloadedId === item.id
                      ? 'checkmark-circle'
                      : 'download-outline'
                  }
                  size={16}
                  color={
                    downloadedId === item.id
                      ? colors.success
                      : colors.primaryLight
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {},
  headerTitle: {},
  body: {},
  uploadZone: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconCircle: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadMainText: {},
  uploadSubText: {},
  fileSelectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {},
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetCard: {
    width: '48%',
  },
  presetTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  formatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formatFrom: {},
  formatTo: {},
  progressCard: {},
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTitle: {},
  progressPct: {},
  track: {
    height: 6,
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  recentCard: {},
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {},
  recentMeta: {},
  downloadBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
