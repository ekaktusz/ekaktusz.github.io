(() => {
  const root = document.documentElement;
  const storageKey = 'crt-settings-v2';
  const developerMode = new URLSearchParams(window.location.search).get('crt') === 'dev';
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const panel = document.getElementById('crt-panel');
  const launcher = document.getElementById('crt-settings');
  const toggle = document.getElementById('crt-toggle');
  const enabledInput = document.getElementById('crt-enabled');
  const motionInput = document.getElementById('crt-motion');
  const presetInput = document.getElementById('crt-preset');
  const status = document.getElementById('crt-status');
  const exportInput = document.getElementById('crt-export');
  const noise = document.getElementById('crt-noise');
  const displacement = document.getElementById('crt-displacement');
  if (!panel || !launcher || !toggle) return;

  const defaults = {
    light: { intensity: 96, scanlines: 31, grain: 42, glow: 74, vignette: 65, flicker: 9, buzz: 0, distortion: 0, speed: 0, motion: true },
    dark: { intensity: 96, scanlines: 49, grain: 42, glow: 74, vignette: 65, flicker: 9, buzz: 0, distortion: 0, speed: 0, motion: true }
  };
  const presets = {
    soft: { intensity: 40, scanlines: 40, grain: 20, glow: 25, vignette: 40, flicker: 15, buzz: 10, distortion: 10, speed: 30 },
    worn: { intensity: 75, scanlines: 60, grain: 35, glow: 45, vignette: 65, flicker: 35, buzz: 30, distortion: 25, speed: 50 },
    unstable: { intensity: 95, scanlines: 80, grain: 65, glow: 65, vignette: 85, flicker: 70, buzz: 75, distortion: 65, speed: 70 }
  };
  const controls = [
    ['intensity', 'intensity', 'picture'],
    ['scanlines', 'scanlines', 'picture'],
    ['grain', 'grain', 'picture'],
    ['glow', 'glow', 'picture'],
    ['vignette', 'vignette', 'picture'],
    ['flicker', 'flicker / rolling band', 'signal'],
    ['buzz', 'buzz / jitter', 'signal'],
    ['distortion', 'distortion', 'signal'],
    ['speed', 'animation speed', 'signal']
  ];
  const profiles = { light: { ...defaults.light }, dark: { ...defaults.dark } };
  // Public pages always use the approved profiles. Experimental overrides stay in developer mode.
  if (developerMode) {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      Object.keys(profiles).forEach(mode => {
        const profile = saved?.[mode];
        if (!profile || typeof profile !== 'object') return;
        controls.forEach(([key]) => {
          if (typeof profile[key] === 'number' && Number.isFinite(profile[key])) {
            profiles[mode][key] = Math.max(0, Math.min(100, Math.round(profile[key])));
          }
        });
        if (typeof profile.motion === 'boolean') profiles[mode].motion = profile.motion;
      });
    } catch (_) {}
  }
  const currentTheme = () => root.dataset.theme || (systemDark.matches ? 'dark' : 'light');
  let theme = currentTheme();
  let settings = profiles[theme];

  const inputs = {};
  const outputs = {};
  if (developerMode) controls.forEach(([key, name, group]) => {
    const label = document.createElement('label');
    label.className = 'crt-setting';
    label.htmlFor = `crt-${key}`;
    const caption = document.createElement('span');
    caption.textContent = name;
    const output = document.createElement('output');
    output.setAttribute('for', `crt-${key}`);
    const input = document.createElement('input');
    Object.assign(input, { id: `crt-${key}`, type: 'range', min: '0', max: '100', step: '1' });
    label.append(caption, output, input);
    document.getElementById(`crt-${group}-controls`).append(label);
    inputs[key] = input;
    outputs[key] = output;
    input.addEventListener('input', () => {
      settings[key] = Number(input.value);
      apply();
    });
  });

  const amount = key => settings[key] * settings.intensity / 10000;
  const rate = () => 0.25 + settings.speed * 0.015;
  const set = (name, value) => root.style.setProperty(`--crt-${name}`, value);
  let frameId = 0;
  let lastFrame = 0;
  let lastWarp = 0;
  let seed = 4;

  // Small luminance dips, horizontal noise, and irregular jitter rather than full-screen flashes.
  const frame = time => {
    if (time - lastFrame >= 40) {
      lastFrame = time;
      const clock = time / 1000 * rate();
      const dip = 0.5 + 0.35 * Math.sin(clock * 37) + 0.15 * Math.sin(clock * 91);
      set('flicker-opacity', (dip * amount('flicker') * 0.12).toFixed(4));
      set('jitter-x', `${((Math.random() - 0.5) * amount('buzz') * 3.2).toFixed(3)}px`);
      set('jitter-y', `${(Math.sin(clock * 53) * amount('buzz') * 0.3).toFixed(3)}px`);
      set('skew', `${(Math.sin(clock * 19) * amount('distortion') * 0.025).toFixed(4)}deg`);
      if (settings.distortion > 0 && time - lastWarp > 350 / rate()) {
        noise.setAttribute('seed', String(seed = seed % 31 + 1));
        lastWarp = time;
      }
    }
    frameId = requestAnimationFrame(frame);
  };

  const syncMotion = () => {
    const animate = root.dataset.crt !== 'off' && settings.motion && !reducedMotion.matches && !document.hidden && settings.intensity > 0;
    root.dataset.crtAnimate = String(animate);
    const needsFrames = animate && (settings.flicker > 0 || settings.buzz > 0 || settings.distortion > 0);
    if (needsFrames && !frameId) frameId = requestAnimationFrame(frame);
    if (!needsFrames) {
      cancelAnimationFrame(frameId);
      frameId = 0;
      set('flicker-opacity', '0');
      set('jitter-x', '0px');
      set('jitter-y', '0px');
      set('skew', '0deg');
    }
  };

  function apply(persist = true) {
    const enabled = root.dataset.crt !== 'off';
    toggle.textContent = enabled ? 'crt on' : 'crt off';
    toggle.setAttribute('aria-pressed', String(enabled));
    if (developerMode) {
      enabledInput.checked = enabled;
      motionInput.checked = settings.motion && !reducedMotion.matches;
      motionInput.disabled = reducedMotion.matches;
      document.getElementById('crt-motion-note').hidden = !reducedMotion.matches;
      document.getElementById('crt-profile').textContent = `editing ${theme} mode`;
      controls.forEach(([key]) => {
        inputs[key].value = settings[key];
        const value = key === 'speed' ? `${rate().toFixed(2)}×` : `${settings[key]}%`;
        outputs[key].textContent = value;
        inputs[key].setAttribute('aria-valuetext', value);
      });
      presetInput.value = controls.every(([key]) => defaults[theme][key] === settings[key]) ? 'default' :
        Object.keys(presets).find(name => controls.every(([key]) => presets[name][key] === settings[key])) || 'custom';
      exportInput.value = JSON.stringify({ enabled, ...settings }, null, 2);
      status.textContent = '';
    }
    set('lines-opacity', amount('scanlines'));
    set('grain-opacity', amount('grain'));
    set('vignette-opacity', amount('vignette'));
    set('glow', `${(amount('glow') * 3).toFixed(2)}px`);
    set('roll-opacity', amount('flicker') * 0.65);
    set('grain-duration', `${(0.4 / rate()).toFixed(2)}s`);
    set('roll-duration', `${(9 / rate()).toFixed(2)}s`);
    set('warp-filter', amount('distortion') > 0 ? 'url("#crt-signal-warp")' : 'none');
    displacement.setAttribute('scale', String(amount('distortion') * 10));
    syncMotion();
    if (persist && developerMode) {
      try { localStorage.setItem(storageKey, JSON.stringify(profiles)); } catch (_) {}
    }
  }

  const setEnabled = enabled => {
    root.dataset.crt = enabled ? 'on' : 'off';
    try { localStorage.setItem('crt-effect', root.dataset.crt); } catch (_) {}
    apply(false);
  };
  toggle.addEventListener('click', () => setEnabled(root.dataset.crt === 'off'));
  enabledInput.addEventListener('change', () => setEnabled(enabledInput.checked));
  motionInput.addEventListener('change', () => { settings.motion = motionInput.checked; apply(); });
  presetInput.addEventListener('change', () => {
    const preset = presetInput.value === 'default' ? defaults[theme] : presets[presetInput.value];
    if (preset) { Object.assign(settings, preset); apply(); }
  });
  document.getElementById('crt-reset').addEventListener('click', () => {
    Object.assign(settings, defaults[theme]);
    setEnabled(true);
    apply();
  });
  document.getElementById('crt-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(exportInput.value);
      status.textContent = 'Settings copied.';
    } catch (_) {
      exportInput.hidden = false;
      exportInput.focus();
      exportInput.select();
      status.textContent = 'Select and copy the settings below.';
    }
  });

  const closePanel = () => {
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  };
  launcher.addEventListener('click', () => {
    if (!developerMode) return;
    if (!panel.hidden) { closePanel(); return; }
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    panel.focus();
  });
  document.getElementById('crt-close').addEventListener('click', closePanel);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); closePanel(); }
  });
  reducedMotion.addEventListener('change', () => apply(false));
  const updateTheme = () => {
    const next = currentTheme();
    if (next === theme) return;
    theme = next;
    settings = profiles[theme];
    apply(false);
  };
  new MutationObserver(updateTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  systemDark.addEventListener('change', updateTheme);
  document.addEventListener('visibilitychange', syncMotion);
  toggle.hidden = false;
  launcher.hidden = !developerMode;
  apply(false);
})();
