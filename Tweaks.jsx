/* Tweaks.jsx — in-design controls for the background wash.
   Honors the parent host's Tweaks toolbar toggle. */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "washIntensity": 60,
  "washFalloff": 40,
  "washPalette": ["#F1DDB9", "#EFC9B5"]
}/*EDITMODE-END*/;

const WASH_PRESETS = [
  ['#E7EEDE', '#F1DDB9'], // Default — sage + sandstone
  ['#E7EEDE', '#DDE7EE'], // Cool — sage + sky
  ['#F1DDB9', '#EFC9B5'], // Warm — sand + clay
  ['#EAE3D2', '#EAE3D2'], // Neutral — flat parchment
];

function Tweaks() {
  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  // Apply wash variables to <body> live as the user drags.
  React.useEffect(() => {
    document.body.style.setProperty('--wash-intensity', String(t.washIntensity));
    document.body.style.setProperty('--wash-falloff', String(t.washFalloff));
    document.body.style.setProperty('--wash-1', t.washPalette[0]);
    document.body.style.setProperty('--wash-2', t.washPalette[1]);
  }, [t.washIntensity, t.washFalloff, t.washPalette]);

  const { TweaksPanel, TweakSection, TweakSlider, TweakColor } = window;

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Background wash">
        <TweakSlider
          label="Intensity"
          value={t.washIntensity}
          min={0} max={100} step={5} unit="%"
          onChange={(v) => setTweak('washIntensity', v)}
        />
        <TweakSlider
          label="Spread"
          value={t.washFalloff}
          min={20} max={80} step={5} unit="%"
          onChange={(v) => setTweak('washFalloff', v)}
        />
        <TweakColor
          label="Palette"
          value={t.washPalette}
          options={WASH_PRESETS}
          onChange={(v) => setTweak('washPalette', v)}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<Tweaks />);
