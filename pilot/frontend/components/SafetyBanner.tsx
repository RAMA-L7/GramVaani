export default function SafetyBanner() {
  return (
    <div className="safety-banner" role="note">
      <span className="safety-dot" aria-hidden="true" />
      <div>
        <strong>EXPERIMENTAL PILOT — NOT AN OFFICIAL SYSTEM</strong>
        <div>For research/testing with synthetic or non-identifying data only. No government integration or submission. Reports shown are sample/experimental previews.</div>
      </div>
    </div>
  );
}
