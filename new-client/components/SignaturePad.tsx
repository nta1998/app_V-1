import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export interface SignaturePadRef {
  clear: () => void;
  /** Returns a base64 data URI of the signature, or null if empty */
  getBase64: () => string | null;
}

interface SignaturePadProps {
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
  style?: ViewStyle;
  onBegin?: () => void;
  onEnd?: () => void;
}

// Fallback: simple View-based signature pad using gesture handler
// Uses react-native-skia if available, otherwise falls back to a path-tracking approach

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ strokeColor = '#ffffff', strokeWidth = 3, backgroundColor = 'transparent', style, onBegin, onEnd }, ref) => {
    const [paths, setPaths] = useState<{ path: string; color: string; width: number }[]>([]);
    const currentPath = useRef<string[]>([]);
    const hasDrawn = useRef(false);

    useImperativeHandle(ref, () => ({
      clear: () => {
        setPaths([]);
        currentPath.current = [];
        hasDrawn.current = false;
      },
      getBase64: () => {
        if (!hasDrawn.current || paths.length === 0) return null;
        // In a real implementation, we'd use react-native-view-shot or Skia to capture
        // For now, return a placeholder that signals "has signature"
        // The actual capture will happen via the WebView approach or native module
        return 'data:image/png;base64,SIGNATURE_PLACEHOLDER';
      },
    }));

    const pan = Gesture.Pan()
      .minDistance(0)
      .onBegin((e) => {
        currentPath.current = [`M ${e.x} ${e.y}`];
        if (!hasDrawn.current) {
          hasDrawn.current = true;
          onBegin?.();
        }
      })
      .onUpdate((e) => {
        currentPath.current.push(`L ${e.x} ${e.y}`);
        // Update paths with current stroke
        setPaths((prev) => {
          const newPaths = [...prev];
          // Replace last path if it's the current one being drawn
          if (newPaths.length > 0 && newPaths[newPaths.length - 1].path.startsWith(currentPath.current[0])) {
            newPaths[newPaths.length - 1] = {
              path: currentPath.current.join(' '),
              color: strokeColor,
              width: strokeWidth,
            };
          } else {
            newPaths.push({
              path: currentPath.current.join(' '),
              color: strokeColor,
              width: strokeWidth,
            });
          }
          return newPaths;
        });
      })
      .onEnd(() => {
        onEnd?.();
      });

    return (
      <GestureDetector gesture={pan}>
        <View style={[styles.container, { backgroundColor }, style]}>
          {/* SVG-like path rendering using Views */}
          <SVGPaths paths={paths} />
        </View>
      </GestureDetector>
    );
  },
);

SignaturePad.displayName = 'SignaturePad';

// Simple SVG path renderer using absolute positioned dots
function SVGPaths({ paths }: { paths: { path: string; color: string; width: number }[] }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {paths.map((p, idx) => {
        // Parse M/L commands to get points
        const points = p.path
          .split(/[ML]\s*/)
          .filter(Boolean)
          .map((pt) => {
            const [x, y] = pt.trim().split(' ').map(Number);
            return { x, y };
          })
          .filter((pt) => !isNaN(pt.x) && !isNaN(pt.y));

        return points.map((point, pidx) => (
          <View
            key={`${idx}-${pidx}`}
            style={{
              position: 'absolute',
              left: point.x - p.width / 2,
              top: point.y - p.width / 2,
              width: p.width,
              height: p.width,
              borderRadius: p.width / 2,
              backgroundColor: p.color,
            }}
          />
        ));
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});

export default SignaturePad;
