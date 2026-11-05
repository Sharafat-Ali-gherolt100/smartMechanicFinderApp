import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const VideoPlayerScreen = ({ route, navigation }) => {
  const { video } = route.params;
  const videoRef = useRef(null);

  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [ended, setEnded] = useState(false);

  // ─── local asset map ──────────────────────────────────────────────────────
  // In react-native-video on Android (MediaPlayer implementation), local resources
  // in res/raw/ must be passed as { uri: 'resource_name' } without scheme or extension.
  // The native ReactVideoView resolves it via getResources().getIdentifier(uri, "raw", packageName).
  const getLocalResourceName = () => {
    const raw = (
      video.filename ||
      (video.file_url ? video.file_url.split('/').pop() : '') ||
      video.title ||
      ''
    ).toLowerCase();

    if (raw.includes('battery')) return 'battery_jumpstart';
    if (raw.includes('radiator') || raw.includes('cooling')) return 'radiator_cooling_fix';
    if (raw.includes('warning') || raw.includes('light') || raw.includes('diagnostic')) return 'car_warning_lights';
    return null;
  };

  const localRes = getLocalResourceName();
  const videoSource = localRes
    ? { uri: localRes }
    : (video.file_url ? { uri: video.file_url } : null);

  // ─── helpers ──────────────────────────────────────────────────────────────
  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  // ─── control visibility ──────────────────────────────────────────────────
  const controlsTimer = useRef(null);

  const showControlsTemporarily = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    if (!paused && !ended) {
      controlsTimer.current = setTimeout(() => setControlsVisible(false), 3000);
    }
  }, [paused, ended]);

  const togglePlayPause = () => {
    if (ended) {
      videoRef.current?.seek(0);
      setEnded(false);
      setPaused(false);
    } else {
      setPaused((p) => !p);
    }
    showControlsTemporarily();
  };

  const handleTap = () => {
    if (controlsVisible) {
      setControlsVisible(false);
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    } else {
      showControlsTemporarily();
    }
  };

  const seek = (forward) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + (forward ? 10 : -10)));
      videoRef.current.seek(newTime);
      setCurrentTime(newTime);
      showControlsTemporarily();
    }
  };

  // ─── render ───────────────────────────────────────────────────────────────
  if (!videoSource) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={64} color="#e74c3c" />
        <Text style={styles.errorTitle}>Video Unavailable</Text>
        <Text style={styles.errorMsg}>Could not load the video file.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* ── Video ─────────────────────────────────────────── */}
      <TouchableOpacity
        activeOpacity={1}
        style={styles.videoWrapper}
        onPress={handleTap}
      >
        <Video
          ref={videoRef}
          source={videoSource}
          style={styles.video}
          resizeMode="contain"
          paused={paused}
          onLoadStart={() => {
            console.log('[VideoPlayer] onLoadStart, source:', JSON.stringify(videoSource));
            setLoading(true);
          }}
          onLoad={(data) => {
            console.log('[VideoPlayer] onLoad success:', JSON.stringify(data));
            setDuration(data.duration);
            setLoading(false);
            showControlsTemporarily();
          }}
          onProgress={({ currentTime: t }) => setCurrentTime(t)}
          onEnd={() => {
            setEnded(true);
            setControlsVisible(true);
          }}
          onError={(e) => {
            console.error('[VideoPlayer] onError:', JSON.stringify(e));
            setLoading(false);
            setError(e?.error?.errorString || (typeof e?.error === 'string' ? e.error : 'Playback error'));
          }}
          repeat={false}
        />

        {/* Loading spinner */}
        {loading && !error && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        {/* Error state */}
        {error && (
          <View style={styles.overlay}>
            <Icon name="error-outline" size={48} color="#e74c3c" />
            <Text style={styles.overlayErrorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => { setError(null); setLoading(true); }}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Controls overlay ──────────────────────────────── */}
        {controlsVisible && !error && (
          <View style={styles.controls}>
            {/* Top bar */}
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.backCircle}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-back" size={22} color="#fff" />
              </TouchableOpacity>
              <View style={styles.titleBlock}>
                <Text style={styles.videoTitle} numberOfLines={1}>{video.title}</Text>
                <Text style={styles.videoCategory}>{video.category}</Text>
              </View>
            </View>

            {/* Center play/pause + seek */}
            <View style={styles.centerRow}>
              <TouchableOpacity style={styles.seekBtn} onPress={() => seek(false)}>
                <Icon name="replay-10" size={36} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.playBtn} onPress={togglePlayPause}>
                <Icon
                  name={ended ? 'replay' : paused ? 'play-arrow' : 'pause'}
                  size={52}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.seekBtn} onPress={() => seek(true)}>
                <Icon name="forward-10" size={36} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Bottom progress bar */}
            <View style={styles.bottomBar}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                <View style={[styles.thumb, { left: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width,
    height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  overlayErrorText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#3498db',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  // ── controls ─────────────────────────────────────────────
  controls: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  backCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleBlock: { flex: 1 },
  videoTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  videoCategory: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 2,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  seekBtn: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    gap: 10,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    minWidth: 38,
    textAlign: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: {
    height: 4,
    backgroundColor: '#3498db',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    top: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
    marginLeft: -7,
  },
  // ── error page ────────────────────────────────────────────
  errorContainer: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  errorMsg: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  backBtn: {
    marginTop: 24,
    paddingHorizontal: 28,
    paddingVertical: 12,
    backgroundColor: '#3498db',
    borderRadius: 10,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default VideoPlayerScreen;
