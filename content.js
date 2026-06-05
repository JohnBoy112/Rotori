function isInboundTradesPage() {
  return location.href.includes("roblox.com/trades") &&
         location.href.includes("tab=Inbound");
}

function injectRotoriStyles() {
  if (document.getElementById("rotori-styles")) return;

  const style = document.createElement("style");
  style.id = "rotori-styles";
  style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap');

  #rotori-panel {
    position: fixed;
    top: 72px;
    right: 20px;
    width: 356px;
    z-index: 999999;
    font-family: "Fredoka", "Trebuchet MS", "Segoe UI", Arial, sans-serif;
    color: #10233f;
    animation: rotori-slide-in 0.48s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes rotori-slide-in {
    from {
      opacity: 0;
      transform: translateX(390px) scale(0.96);
    }

    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }
    .rotori-pop-hover {
  transition:
    transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.18s ease,
    filter 0.18s ease;
  will-change: transform;
}

.rotori-pop-hover:hover {
  transform: translateY(-2px) scale(1.025);
  filter: brightness(1.04);
}

.rotori-pop-hover:active {
  transform: translateY(2px) scale(0.985);
}

.rotori-click-pop {
  animation: rotori-click-pop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes rotori-click-pop {
  0% {
    transform: scale(1);
  }

  40% {
    transform: scale(0.94);
  }

  100% {
    transform: scale(1);
  }
}

  .rotori-card {
    background: #ffffff;
    border-radius: 22px;
    overflow: hidden;
    border: 4px solid rgba(255,255,255,0.95);
    box-shadow:
      0 20px 45px rgba(23, 71, 140, 0.35),
      0 4px 0 rgba(0,0,0,0.08);
  }

  .rotori-header {
    min-height: 82px;
    padding: 12px 18px;
    background: #ff2b2f;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: inset 0 -4px 0 rgba(0,0,0,0.08);
  }

  .rotori-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .rotori-logo-wrap {
    width: 64px;
    height: 64px;
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
    flex-shrink: 0;
    filter: drop-shadow(0 4px 0 rgba(0,0,0,0.14));
  }
    /* Cool Rotori logo hover: scan ring + wiggle + shine */
.rotori-logo-wrap {
  position: relative;
  cursor: pointer;
  isolation: isolate;
}

.rotori-logo {
  position: relative;
  z-index: 2;
  transform-origin: center;
  transition:
    filter 0.18s ease,
    transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.rotori-logo-wrap::before {
  content: "";
  position: absolute;
  inset: 6px;
  border-radius: 999px;
  border: 2px solid rgba(69, 184, 255, 0.8);
  opacity: 0;
  transform: scale(0.72);
  pointer-events: none;
  z-index: 0;
}

.rotori-logo-wrap::after {
  content: "";
  position: absolute;
  top: -8px;
  left: -22px;
  width: 16px;
  height: 86px;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(255,255,255,0.85),
    transparent
  );
  opacity: 0;
  transform: translateX(-35px) rotate(18deg);
  pointer-events: none;
  z-index: 3;
}

.rotori-logo-wrap:hover .rotori-logo {
  animation: rotori-logo-wiggle 0.58s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter:
    brightness(1.1)
    drop-shadow(0 0 8px rgba(69,184,255,0.65));
}

.rotori-logo-wrap:hover::before {
  animation: rotori-logo-scan-ring 0.72s ease-out;
}

.rotori-logo-wrap:hover::after {
  animation: rotori-logo-shine 0.65s ease;
}

@keyframes rotori-logo-wiggle {
  0% {
    transform: rotate(0deg) scale(1);
  }

  25% {
    transform: rotate(-8deg) scale(1.08);
  }

  50% {
    transform: rotate(6deg) scale(1.12);
  }

  75% {
    transform: rotate(-3deg) scale(1.06);
  }

  100% {
    transform: rotate(0deg) scale(1);
  }
}

@keyframes rotori-logo-scan-ring {
  0% {
    opacity: 0.75;
    transform: scale(0.72);
  }

  100% {
    opacity: 0;
    transform: scale(1.55);
  }
}

@keyframes rotori-logo-shine {
  0% {
    opacity: 0;
    transform: translateX(-35px) rotate(18deg);
  }

  20% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translateX(92px) rotate(18deg);
  }
}

  .rotori-logo {
    width: 64px;
    height: 64px;
    object-fit: contain;
    display: block;
  }

  .rotori-title {
    color: #ffffff;
    font-size: 25px;
    font-weight: 700;
    line-height: 0.95;
    letter-spacing: 0.2px;
    text-shadow:
      0 3px 0 rgba(0,0,0,0.16),
      0 6px 12px rgba(0,0,0,0.15);
  }

  .rotori-subtitle {
  margin-top: 5px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  opacity: 0.95;
  text-shadow: 0 2px 0 rgba(0,0,0,0.14);
  transition: filter 0.18s ease, transform 0.18s ease;
}

.rotori-brand:hover .rotori-subtitle {
  background: linear-gradient(
    90deg,
    #ff004c,
    #ff9f00,
    #fff200,
    #00ff85,
    #00c8ff,
    #7a5cff,
    #ff00d4,
    #ff004c
  );
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: none;
  animation: rotori-rgb-text 1.2s linear infinite;
  transform: translateY(-1px);
}

@keyframes rotori-rgb-text {
  from {
    background-position: 0% 50%;
  }

  to {
    background-position: 300% 50%;
  }
}

  .rotori-icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: rgba(0,0,0,0.18);
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    inset 0 -3px 0 rgba(0,0,0,0.14),
    0 3px 0 rgba(255,255,255,0.16);
  transition:
    transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
    background 0.18s ease,
    box-shadow 0.18s ease,
    filter 0.18s ease;
}

.rotori-icon-btn:hover {
  transform: translateY(-2px) scale(1.08);
  background: rgba(0,0,0,0.24);
  filter: brightness(1.05);
}

.rotori-icon-btn:active {
  transform: translateY(2px) scale(0.94);
}

  .rotori-body {
    padding: 14px;
    max-height: calc(100vh - 170px);
    overflow-y: auto;
    overflow-x: hidden;
    background:
      radial-gradient(circle at 14px 14px, rgba(255,255,255,0.18) 2px, transparent 3px),
      linear-gradient(180deg, #5ab0ff, #2f8cff);
    background-size: 28px 28px, 100% 100%;
    transition:
      max-height 0.42s cubic-bezier(0.16, 1, 0.3, 1),
      opacity 0.24s ease,
      transform 0.32s ease,
      padding 0.28s ease;
  }

  .rotori-body::-webkit-scrollbar {
    width: 8px;
  }

  .rotori-body::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.2);
    border-radius: 999px;
  }

  .rotori-body::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.72);
    border-radius: 999px;
    border: 2px solid rgba(47,140,255,0.75);
  }

  #rotori-panel {
  transition:
    width 0.28s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.22s ease;
}

#rotori-panel.rotori-collapsed {
  width: 76px;
  cursor: pointer;
}

#rotori-panel.rotori-collapsed .rotori-card {
  background: transparent;
  border: none;
  box-shadow: none;
  overflow: visible;
}

#rotori-panel.rotori-collapsed .rotori-header {
  min-height: 76px;
  padding: 0;
  background: transparent;
  box-shadow: none;
  justify-content: center;
}

#rotori-panel.rotori-collapsed .rotori-brand {
  gap: 0;
}

#rotori-panel.rotori-collapsed .rotori-logo-wrap {
  width: 76px;
  height: 76px;
  filter:
    drop-shadow(0 7px 0 rgba(0,0,0,0.18))
    drop-shadow(0 14px 18px rgba(0,0,0,0.22));
  transition:
    transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
    filter 0.18s ease;
}

#rotori-panel.rotori-collapsed .rotori-logo {
  width: 76px;
  height: 76px;
}

#rotori-panel.rotori-collapsed:hover .rotori-logo-wrap {
  transform: translateY(-3px) scale(1.06) rotate(-3deg);
  filter:
    drop-shadow(0 9px 0 rgba(0,0,0,0.16))
    drop-shadow(0 18px 22px rgba(0,0,0,0.26));
}

#rotori-panel.rotori-collapsed .rotori-title,
#rotori-panel.rotori-collapsed .rotori-subtitle,
#rotori-panel.rotori-collapsed .rotori-icon-btn,
#rotori-panel.rotori-collapsed .rotori-body {
  display: none;
}

  .rotori-primary-btn {
    position: relative;
    width: 100%;
    min-height: 54px;
    border: none;
    border-radius: 18px;
    padding: 14px 18px;
    background: #111111;
    color: #ffffff;
    cursor: pointer;
    font-size: 17px;
    font-weight: 700;
    letter-spacing: 0.1px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    box-shadow:
      inset 0 -5px 0 rgba(0,0,0,0.35),
      0 6px 0 rgba(0,0,0,0.18),
      0 12px 22px rgba(0,0,0,0.18);
    transition:
      transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow 0.18s ease,
      filter 0.18s ease;
  }

  .rotori-primary-btn:hover {
    transform: translateY(-2px) scale(1.015);
    filter: brightness(1.08);
    box-shadow:
      inset 0 -5px 0 rgba(0,0,0,0.35),
      0 8px 0 rgba(0,0,0,0.16),
      0 16px 26px rgba(0,0,0,0.22);
  }

  .rotori-primary-btn:active {
    transform: translateY(3px) scale(0.99);
    box-shadow:
      inset 0 -2px 0 rgba(0,0,0,0.35),
      0 3px 0 rgba(0,0,0,0.18),
      0 8px 16px rgba(0,0,0,0.18);
  }

  .rotori-btn-shine {
    position: absolute;
    top: -45%;
    left: -35%;
    width: 38%;
    height: 190%;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.38), transparent);
    transform: translateX(-180%) rotate(18deg);
    opacity: 0;
    pointer-events: none;
  }

  .rotori-primary-btn:hover .rotori-btn-shine {
    opacity: 1;
    animation: rotori-button-shine 0.85s ease;
  }

  @keyframes rotori-button-shine {
    from {
      transform: translateX(-180%) rotate(18deg);
    }

    to {
      transform: translateX(460%) rotate(18deg);
    }
  }

  .rotori-btn-text,
  .rotori-btn-icon {
    position: relative;
    z-index: 1;
  }

  .rotori-btn-icon {
    width: 25px;
    height: 25px;
    border-radius: 999px;
    background: #45b8ff;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    box-shadow: inset 0 -3px 0 rgba(0,0,0,0.18);
    transition: transform 0.22s ease;
  }

  .rotori-primary-btn:hover .rotori-btn-icon {
    transform: translateX(3px) translateY(-1px) rotate(-8deg);
  }

  .rotori-primary-btn.rotori-scanning {
    cursor: wait;
    pointer-events: none;
    animation: rotori-button-pulse 0.9s ease-in-out infinite;
  }

  .rotori-primary-btn.rotori-scanning .rotori-btn-icon {
    animation: rotori-scan-orbit 0.85s linear infinite;
  }

  .rotori-primary-btn.rotori-button-burst {
    animation: rotori-button-burst 0.38s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes rotori-button-pulse {
    0%, 100% {
      transform: scale(1);
    }

    50% {
      transform: scale(1.025);
    }
  }

  @keyframes rotori-scan-orbit {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  @keyframes rotori-button-burst {
    0% {
      transform: scale(1);
    }

    40% {
      transform: scale(0.96);
    }

    100% {
      transform: scale(1);
    }
  }

  .rotori-results {
    margin-top: 14px;
    font-size: 14px;
  }

  .rotori-empty,
  .rotori-loading,
  .rotori-error,
  .rotori-verdict,
  .rotori-stat,
  .rotori-details {
    border-radius: 18px;
    border: 3px solid #ffffff;
    box-shadow:
      inset 0 -4px 0 rgba(0,0,0,0.08),
      0 5px 0 rgba(0,0,0,0.12),
      0 10px 20px rgba(0,0,0,0.12);
  }

  .rotori-empty {
    color: #12233c;
    background: #ffffff;
    padding: 16px;
    text-align: center;
    font-size: 15px;
    font-weight: 700;
  }

  .rotori-verdict {
    padding: 13px 15px;
    font-size: 17px;
    font-weight: 700;
    margin-bottom: 12px;
    line-height: 1.2;
    color: #ffffff;
    text-shadow: 0 2px 0 rgba(0,0,0,0.16);
  }

  .rotori-good {
    background: #20c761;
  }

  .rotori-bad {
    background: #ff2b59;
  }

  .rotori-mid {
    background: #ffb629;
  }

  .rotori-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 12px;
  }

  .rotori-stat {
    background: #ffffff;
    padding: 12px;
    color: #11233e;
  }

  .rotori-stat-label {
    color: #60708a;
    font-size: 12px;
    font-weight: 700;
    margin-bottom: 5px;
  }

  .rotori-stat-value {
    color: #10233f;
    font-weight: 700;
    font-size: 20px;
    line-height: 1;
  }

  .rotori-details {
  background: #ffffff;
  color: #10233f;
  margin-top: 10px;
  overflow: hidden;
  transition:
    transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.18s ease,
    filter 0.18s ease;
  will-change: transform;
}

.rotori-details:hover {
  transform: translateY(-2px) scale(1.015);
  filter: brightness(1.025);
}

.rotori-details:active {
  transform: translateY(2px) scale(0.985);
}

.rotori-details.rotori-click-pop {
  animation: rotori-click-pop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

 .rotori-details summary {
  padding: 13px 15px;
  cursor: pointer;
  font-weight: 700;
  font-size: 17px;
  color: #10233f;
  list-style: none;
  user-select: none;
}

  .rotori-details summary::-webkit-details-marker {
    display: none;
  }

  .rotori-details summary::after {
    content: "+";
    float: right;
    color: #3aaeff;
    font-size: 22px;
    line-height: 14px;
  }

  .rotori-details[open] summary::after {
    content: "−";
  }

  .rotori-details-content {
    padding: 0 13px 14px 13px;
    color: #283a57;
    line-height: 1.45;
  }

  .rotori-explainer-note {
    color: #667792;
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 10px;
  }

  .rotori-reason-card {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    background: #eef6ff;
    border: 2px solid #d8ebff;
    border-radius: 15px;
    padding: 11px;
    margin-top: 9px;
    opacity: 0;
    transform: translateY(10px) scale(0.98);
    animation: rotori-reason-pop 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: calc(var(--i) * 0.08s);
  }

  .rotori-reason-dot {
    width: 26px;
    height: 26px;
    border-radius: 999px;
    background: #1683ff;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    flex-shrink: 0;
    box-shadow: inset 0 -3px 0 rgba(0,0,0,0.14);
  }

  .rotori-reason-text {
    color: #10233f;
    line-height: 1.42;
    font-size: 14px;
    font-weight: 700;
    min-width: 0;
    overflow-wrap: break-word;
  }

  .rotori-reason-number {
    display: inline-block;
    color: #ffffff;
    background: #1683ff;
    border-radius: 9px;
    padding: 1px 7px;
    margin: 0 1px;
    font-weight: 700;
    white-space: nowrap;
    box-shadow: inset 0 -2px 0 rgba(0,0,0,0.13);
  }

  @keyframes rotori-reason-pop {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.98);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .rotori-result-shell {
    animation: rotori-result-shell-in 0.46s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .rotori-results-enter .rotori-verdict,
  .rotori-results-enter .rotori-stat,
  .rotori-results-enter .rotori-details {
    opacity: 0;
    animation: rotori-result-card-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .rotori-results-enter .rotori-verdict {
    animation-delay: 0.04s;
  }

  .rotori-results-enter .rotori-stat:nth-child(1) {
    animation-delay: 0.1s;
  }

  .rotori-results-enter .rotori-stat:nth-child(2) {
    animation-delay: 0.15s;
  }

  .rotori-results-enter .rotori-stat:nth-child(3) {
    animation-delay: 0.2s;
  }

  .rotori-results-enter .rotori-stat:nth-child(4) {
    animation-delay: 0.25s;
  }

  .rotori-results-enter .rotori-details:nth-of-type(1) {
    animation-delay: 0.3s;
  }

  .rotori-results-enter .rotori-details:nth-of-type(2) {
    animation-delay: 0.36s;
  }

  .rotori-results-enter .rotori-details:nth-of-type(3) {
    animation-delay: 0.42s;
  }

  @keyframes rotori-result-shell-in {
    from {
      opacity: 0;
      transform: translateY(14px) scale(0.98);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes rotori-result-card-in {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.96);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .rotori-spinner {
    width: 26px;
    height: 26px;
    border: 4px solid rgba(22,131,255,0.18);
    border-top: 4px solid #1683ff;
    border-radius: 50%;
    animation: rotori-spin 0.75s linear infinite;
    margin: 0 auto 8px auto;
  }

  @keyframes rotori-spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  .rotori-loading {
    position: relative;
    overflow: hidden;
    color: #10233f;
    background: #ffffff;
    padding: 16px;
    text-align: center;
  }

  .rotori-loading::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, transparent, rgba(90,176,255,0.22), transparent);
    transform: translateX(-120%);
    animation: rotori-loading-sweep 1.1s ease-in-out infinite;
  }

  .rotori-loading-title,
  .rotori-loading-subtitle,
  .rotori-loading-dots {
    position: relative;
    z-index: 1;
  }

  .rotori-loading-title {
    font-size: 16px;
    font-weight: 700;
    color: #10233f;
  }

  .rotori-loading-subtitle {
    color: #667792;
    font-size: 13px;
    font-weight: 700;
    margin-top: 4px;
  }

  .rotori-loading-dots {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 10px;
  }

  .rotori-loading-dots span {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #1683ff;
    animation: rotori-dot-bounce 0.8s ease-in-out infinite;
  }

  .rotori-loading-dots span:nth-child(2) {
    animation-delay: 0.12s;
  }

  .rotori-loading-dots span:nth-child(3) {
    animation-delay: 0.24s;
  }

  @keyframes rotori-loading-sweep {
    from {
      transform: translateX(-120%);
    }

    to {
      transform: translateX(120%);
    }
  }

  @keyframes rotori-dot-bounce {
    0%, 100% {
      transform: translateY(0);
      opacity: 0.45;
    }

    50% {
      transform: translateY(-5px);
      opacity: 1;
    }
  }

  .rotori-error {
    background: #ff2b59;
    color: #ffffff;
    padding: 14px;
    line-height: 1.35;
    font-size: 14px;
    font-weight: 700;
  }

  .rotori-item-list {
    margin: 8px 0 0 0;
    padding-left: 18px;
  }
    /* Make every clickable Rotori control pop like the Analyze button */
#rotori-panel button,
#rotori-panel .rotori-details,
#rotori-panel .rotori-details summary {
  transition:
    transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.18s ease,
    filter 0.18s ease !important;
  will-change: transform;
}

/* All normal buttons */
#rotori-panel button:hover {
  transform: translateY(-3px) scale(1.035) !important;
  filter: brightness(1.08);
}

#rotori-panel button:active {
  transform: translateY(3px) scale(0.96) !important;
}

/* Expandable cards like Explanation / Items you give / Items you receive */
#rotori-panel .rotori-details:hover {
  transform: translateY(-3px) scale(1.025) !important;
  filter: brightness(1.06);
  box-shadow:
    inset 0 -4px 0 rgba(0,0,0,0.08),
    0 8px 0 rgba(0,0,0,0.12),
    0 16px 24px rgba(0,0,0,0.16) !important;
}

#rotori-panel .rotori-details:active {
  transform: translateY(3px) scale(0.965) !important;
}

/* Make the summary row feel clickable too */
#rotori-panel .rotori-details summary {
  cursor: pointer;
  user-select: none;
}

#rotori-panel .rotori-details summary:hover {
  transform: scale(1.01) !important;
}

#rotori-panel .rotori-details summary:active {
  transform: scale(0.97) !important;
}

/* Click bounce animation */
#rotori-panel .rotori-click-pop {
  animation: rotori-click-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}

@keyframes rotori-click-pop {
  0% {
    transform: translateY(0) scale(1);
  }

  35% {
    transform: translateY(4px) scale(0.92);
  }

  70% {
    transform: translateY(-2px) scale(1.04);
  }

  100% {
    transform: translateY(0) scale(1);
  }
}

  .rotori-item-list li {
    margin-bottom: 5px;
    font-size: 14px;
    font-weight: 700;
  }

  .rotori-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .rotori-theme-btn {
    font-size: 16px;
  }

  #rotori-panel.rotori-dark .rotori-card {
    background: #0f172a;
    border-color: rgba(148, 163, 184, 0.55);
    box-shadow:
      0 20px 45px rgba(0, 0, 0, 0.45),
      0 4px 0 rgba(0, 0, 0, 0.28);
  }

  #rotori-panel.rotori-dark .rotori-body {
    background:
      radial-gradient(circle at 14px 14px, rgba(255,255,255,0.09) 2px, transparent 3px),
      linear-gradient(180deg, #1e293b, #0f172a);
  }

  #rotori-panel.rotori-dark .rotori-empty,
  #rotori-panel.rotori-dark .rotori-loading,
  #rotori-panel.rotori-dark .rotori-stat,
  #rotori-panel.rotori-dark .rotori-details {
    background: #111827;
    color: #f8fafc;
    border-color: rgba(148, 163, 184, 0.42);
    box-shadow:
      inset 0 -4px 0 rgba(0,0,0,0.22),
      0 5px 0 rgba(0,0,0,0.24),
      0 10px 20px rgba(0,0,0,0.22);
  }

  #rotori-panel.rotori-dark .rotori-stat-label,
  #rotori-panel.rotori-dark .rotori-explainer-note {
    color: #93a4bb;
  }

  #rotori-panel.rotori-dark .rotori-stat-value,
  #rotori-panel.rotori-dark .rotori-details summary,
  #rotori-panel.rotori-dark .rotori-reason-text {
    color: #f8fafc;
  }

  #rotori-panel.rotori-dark .rotori-details-content {
    color: #dbeafe;
  }

  #rotori-panel.rotori-dark .rotori-reason-card {
    background: #1e293b;
    border-color: rgba(96, 165, 250, 0.28);
  }

  #rotori-panel.rotori-dark .rotori-reason-number {
    background: #2563eb;
    color: #ffffff;
  }

  body.rotori-dark-mode .rotori-item-modal {
    background: #111827;
    border-color: rgba(148, 163, 184, 0.48);
    color: #f8fafc;
  }

  body.rotori-dark-mode .rotori-item-modal-body {
    background:
      radial-gradient(circle at 14px 14px, rgba(255,255,255,0.08) 2px, transparent 3px),
      linear-gradient(180deg, #1e293b 0%, #0f172a 70%);
  }

  body.rotori-dark-mode .rotori-item-modal-hero,
  body.rotori-dark-mode .rotori-item-modal-stat,
  body.rotori-dark-mode .rotori-item-modal-section {
    background: rgba(30, 41, 59, 0.96);
    border-color: rgba(148, 163, 184, 0.28);
  }

  body.rotori-dark-mode .rotori-item-modal-stat-value,
  body.rotori-dark-mode .rotori-item-modal-section-title {
    color: #f8fafc;
  }

  body.rotori-dark-mode .rotori-item-modal-stat-label,
  body.rotori-dark-mode .rotori-item-modal-stat-sub,
  body.rotori-dark-mode .rotori-item-modal-summary,
  body.rotori-dark-mode .rotori-item-modal-footer {
    color: #cbd5e1;
  }

  body.rotori-dark-mode .rotori-item-modal-note {
    background: rgba(15, 23, 42, 0.72);
    border-color: rgba(96, 165, 250, 0.28);
    color: #dbeafe;
  }
`;

  document.head.appendChild(style);
}

function injectRotoriSolidColorOverrides() {
  const old = document.getElementById("rotori-solid-color-overrides");
  if (old) old.remove();

  const style = document.createElement("style");
  style.id = "rotori-solid-color-overrides";
  style.textContent = `
    /* No gradients anywhere — solid colors only */

    #rotori-panel .rotori-body {
      background: #2f8cff !important;
      background-image: none !important;
    }

    #rotori-panel.rotori-dark .rotori-body {
      background: #0f172a !important;
      background-image: none !important;
    }

    #rotori-panel .rotori-brand:hover .rotori-subtitle {
      background: none !important;
      background-image: none !important;
      -webkit-background-clip: initial !important;
      background-clip: initial !important;
      color: #ffffff !important;
      text-shadow: 0 2px 0 rgba(0,0,0,0.14) !important;
      animation: none !important;
    }

    #rotori-panel .rotori-btn-shine,
    #rotori-panel .rotori-logo-wrap::after,
    #rotori-panel .rotori-loading::before {
      display: none !important;
      background: none !important;
      background-image: none !important;
      animation: none !important;
    }

    #rotori-panel .rotori-market-section-header {
      background: #ffffff !important;
      background-image: none !important;
    }

    #rotori-panel.rotori-dark .rotori-market-section-header {
      background: #111827 !important;
      background-image: none !important;
    }

    #rotori-panel .rotori-market-item {
      background: #f4f8ff !important;
      background-image: none !important;
    }

    #rotori-panel.rotori-dark .rotori-market-item {
      background: #111827 !important;
      background-image: none !important;
    }

    #rotori-panel .rotori-market-item-projected {
      background: rgba(255, 145, 35, 0.18) !important;
      background-image: none !important;
    }

    #rotori-panel.rotori-dark .rotori-market-item-projected {
      background: rgba(255, 145, 35, 0.16) !important;
      background-image: none !important;
    }

    #rotori-panel .rotori-market-thumb-wrap {
      background: #d9eeff !important;
      background-image: none !important;
    }

    #rotori-panel.rotori-dark .rotori-market-thumb-wrap {
      background: #1e293b !important;
      background-image: none !important;
    }

    #rotori-panel .rotori-market-type-valued {
      background: #ff4f45 !important;
      background-image: none !important;
    }

    #rotori-panel .rotori-market-type-rap {
      background: #1683ff !important;
      background-image: none !important;
    }

    #rotori-panel .rotori-market-type-projected {
      background: #ff8a2b !important;
      background-image: none !important;
    }

    body .rotori-item-modal-top {
      background: #ff2b2f !important;
      background-image: none !important;
    }

    body .rotori-item-modal-body {
      background: #edf7ff !important;
      background-image: none !important;
    }

    body.rotori-dark-mode .rotori-item-modal-body {
      background: #0f172a !important;
      background-image: none !important;
    }

    body .rotori-item-modal-hero,
    body .rotori-item-modal-stat,
    body .rotori-item-modal-section {
      background: #f4f8ff !important;
      background-image: none !important;
    }

    body.rotori-dark-mode .rotori-item-modal-hero,
    body.rotori-dark-mode .rotori-item-modal-stat,
    body.rotori-dark-mode .rotori-item-modal-section {
      background: #1e293b !important;
      background-image: none !important;
    }

    body .rotori-item-modal-thumb-wrap {
      background: #d9eeff !important;
      background-image: none !important;
    }

    body.rotori-dark-mode .rotori-item-modal-thumb-wrap {
      background: #1e293b !important;
      background-image: none !important;
    }

    body .rotori-item-modal-bigtype.value {
      background: #ff4f45 !important;
      background-image: none !important;
    }

    body .rotori-item-modal-bigtype.rap {
      background: #1683ff !important;
      background-image: none !important;
    }
  `;

  document.head.appendChild(style);
}

function createRotoriPanel() {
  if (document.getElementById("rotori-panel")) return;

  injectRotoriStyles();
  injectRotoriSolidColorOverrides();

const panel = document.createElement("div");
panel.id = "rotori-panel";
panel.classList.add("rotori-collapsed");


const rotoriLogoUrl = chrome.runtime.getURL("assets/RotoriLogo.png");

panel.innerHTML = `
  <div class="rotori-card">
    <div class="rotori-header">
      <div class="rotori-brand">
        <div class="rotori-logo-wrap">
          <img class="rotori-logo" src="${rotoriLogoUrl}" alt="Rotori">
        </div>

        <div>
          <div class="rotori-title">Rotori</div>
          <div class="rotori-subtitle">Launtori's Great Trade Analyzer</div>
        </div>
      </div>

      <div class="rotori-header-actions">
        <button class="rotori-theme-btn rotori-icon-btn rotori-pop-hover" id="rotori-dark-mode" aria-pressed="false" title="Turn on dark mode">🌙</button>
        <button class="rotori-icon-btn rotori-pop-hover" id="rotori-minimize" aria-expanded="true">−</button>
      </div>
    </div>

    <div class="rotori-body" id="rotori-body">
  <button class="rotori-primary-btn" id="rotori-scan-btn">
  <span class="rotori-btn-shine"></span>
  <span class="rotori-btn-text">Analyze Current Trade</span>
  <span class="rotori-btn-icon">↗</span>
</button>

  <div class="rotori-results" id="rotori-results">
    <div class="rotori-empty">
      Click analyze to scan the current inbound trade.
    </div>
  </div>
</div>
  </div>
`;

  document.body.appendChild(panel);
  function playClickPop(element) {
  if (!element) return;

  element.classList.remove("rotori-click-pop");

  void element.offsetWidth;

  element.classList.add("rotori-click-pop");

  setTimeout(() => {
    element.classList.remove("rotori-click-pop");
  }, 320);
}

panel.addEventListener("click", event => {
  const clickedButton = event.target.closest("button");
  const clickedDetails = event.target.closest(".rotori-details");

  if (clickedButton) {
    playClickPop(clickedButton);
  }

  if (clickedDetails && event.target.closest("summary")) {
    playClickPop(clickedDetails);
  }
});

  document.getElementById("rotori-scan-btn").addEventListener("click", scanInboundTrades);

const header = panel.querySelector(".rotori-header");
const minimizeBtn = document.getElementById("rotori-minimize");
const darkModeBtn = document.getElementById("rotori-dark-mode");

function setRotoriDarkMode(enabled) {
  panel.classList.toggle("rotori-dark", enabled);
  document.body.classList.toggle("rotori-dark-mode", enabled);

  if (darkModeBtn) {
    darkModeBtn.textContent = enabled ? "☀️" : "🌙";
    darkModeBtn.setAttribute("aria-pressed", String(enabled));
    darkModeBtn.title = enabled ? "Turn off dark mode" : "Turn on dark mode";
  }
}

if (darkModeBtn) {
  darkModeBtn.addEventListener("click", event => {
    event.stopPropagation();
    setRotoriDarkMode(!panel.classList.contains("rotori-dark"));
  });
}

function setRotoriCollapsed(collapsed) {
  panel.classList.toggle("rotori-collapsed", collapsed);

  if (minimizeBtn) {
    minimizeBtn.textContent = collapsed ? "+" : "−";
    minimizeBtn.setAttribute("aria-expanded", String(!collapsed));
  }
}

// Click the logo/header while collapsed to expand the full panel
header.addEventListener("click", event => {
  if (!panel.classList.contains("rotori-collapsed")) return;

  event.stopPropagation();
  setRotoriCollapsed(false);
});

// Click minus while expanded to collapse back to logo-only
minimizeBtn.addEventListener("click", event => {
  event.stopPropagation();
  setRotoriCollapsed(true);
});
}

function cleanTradeItems(rawText) {
  return rawText
    .split("\n")
    .map(x => x.trim())
    .filter(Boolean)
    .filter(line => !/^[\d,]+$/.test(line))
    .filter(line => line !== "#")
    .filter(line => !/^Total Value/i.test(line))
    .filter(line => !/^Accept$/i.test(line))
    .filter(line => !/^Counter$/i.test(line))
    .filter(line => !/^Decline$/i.test(line))

    // Ignore Robux section because Roblox already includes it in the total.
    .filter(line => !/^Robux Offered/i.test(line))
    .filter(line => !/^After 30% fee/i.test(line))
    .filter(line => !/^\(?After 30% fee\)?$/i.test(line))
    .filter(line => !/^Robux$/i.test(line));
}
function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fmt(value) {
  const num = Number(value || 0);
  return num.toLocaleString();
}

function verdictClass(verdict) {
  const v = String(verdict || "").toLowerCase();

  if (v.includes("accept") || v.includes("good") || v.includes("great") || v.includes("win")) {
    return "rotori-good";
  }

  if (v.includes("decline") || v.includes("bad") || v.includes("loss") || v.includes("auto decline")) {
    return "rotori-bad";
  }

  return "rotori-mid";
}

function renderItemList(title, items) {
  return `
    <details class="rotori-details">
      <summary>${escapeHTML(title)} (${items.length})</summary>
      <div class="rotori-details-content">
        <ul class="rotori-item-list">
          ${items.map(item => `<li>${escapeHTML(item)}</li>`).join("")}
        </ul>
      </div>
    </details>
  `;
}

function injectRotoriMarketCardStyles() {
  if (document.getElementById("rotori-market-card-styles")) return;

  const style = document.createElement("style");
  style.id = "rotori-market-card-styles";
  style.textContent = `
    .rotori-result-shell {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .rotori-market-section {
      background: rgba(255,255,255,0.96);
      border: 2px solid rgba(255,255,255,0.95);
      border-radius: 20px;
      box-shadow:
        0 10px 24px rgba(16, 58, 118, 0.18),
        inset 0 -3px 0 rgba(0,0,0,0.04);
      overflow: hidden;
    }

    .rotori-market-section-header {
      padding: 11px 13px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background:
        linear-gradient(135deg, rgba(22,131,255,0.13), rgba(255,43,47,0.08)),
        #ffffff;
      border-bottom: 1px solid rgba(20, 96, 190, 0.12);
    }

    .rotori-market-title {
      font-size: 15px;
      font-weight: 900;
      color: #10233f;
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .rotori-market-count {
      font-size: 11px;
      font-weight: 900;
      color: #ffffff;
      background: #1683ff;
      border-radius: 999px;
      padding: 4px 8px;
      box-shadow: inset 0 -2px 0 rgba(0,0,0,0.16);
    }

    .rotori-market-list {
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 9px;
    }

    .rotori-market-item {
      position: relative;
      display: grid;
      grid-template-columns: 52px 1fr;
      gap: 10px;
      padding: 9px;
      border-radius: 17px;
      background:
        linear-gradient(135deg, rgba(255,255,255,0.96), rgba(235,246,255,0.94));
      border: 1px solid rgba(22,131,255,0.16);
      box-shadow:
        inset 0 -2px 0 rgba(22,131,255,0.06);
      transition:
        transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
        box-shadow 0.18s ease,
        border-color 0.18s ease;
    }
        .rotori-market-item-projected {
  background:
    linear-gradient(135deg, rgba(255, 160, 35, 0.22), rgba(255, 108, 43, 0.16)),
    #ffffff !important;
  border-color: rgba(255, 145, 35, 0.75) !important;
  box-shadow:
    inset 0 -3px 0 rgba(176, 72, 0, 0.10) !important;
}

.rotori-market-item-projected .rotori-market-warning {
  background: rgba(255, 148, 43, 0.13);
  border-color: rgba(255, 145, 35, 0.35);
}

    .rotori-market-item:hover {
      transform: translateY(-2px) scale(1.012);
      border-color: rgba(22,131,255,0.32);
      box-shadow:
        inset 0 -2px 0 rgba(22,131,255,0.08);
    }

    .rotori-market-thumb-wrap {
      position: relative;
      width: 52px;
      height: 52px;
      border-radius: 15px;
      background:
        radial-gradient(circle at 30% 20%, #ffffff, #d9eeff);
      border: 2px solid rgba(255,255,255,0.95);
      box-shadow:
        inset 0 -3px 0 rgba(0,0,0,0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .rotori-market-thumb {
      width: 48px;
      height: 48px;
      object-fit: contain;
      display: block;
      filter: none;
    }

    .rotori-side-pill {
      position: absolute;
      left: -5px;
      top: -5px;
      width: 20px;
      height: 20px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 12px;
      font-weight: 900;
      box-shadow: 0 4px 8px rgba(0,0,0,0.18);
      z-index: 2;
    }

    .rotori-side-giving {
      background: #ff2b2f;
    }

    .rotori-side-receiving {
      background: #1683ff;
    }

    .rotori-market-main {
      min-width: 0;
    }

    .rotori-market-topline {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 6px;
    }

    .rotori-market-name {
      font-size: 13px;
      line-height: 1.05;
      color: #10233f;
      font-weight: 900;
      letter-spacing: -0.1px;
    }

    .rotori-market-type {
      flex-shrink: 0;
      font-size: 10px;
      line-height: 1;
      font-weight: 900;
      color: #ffffff;
      padding: 5px 7px;
      border-radius: 999px;
      background: #111111;
      box-shadow: inset 0 -2px 0 rgba(0,0,0,0.28);
    }
      .rotori-market-type-projected {
  background: linear-gradient(135deg, #ff9f1c, #ff6b2b) !important;
  box-shadow:
    inset 0 -2px 0 rgba(120, 45, 0, 0.28);
}

    .rotori-market-type-valued {
      background: linear-gradient(135deg, #ff2b2f, #ff8a2b);
    }

    .rotori-market-type-rap {
      background: linear-gradient(135deg, #1683ff, #00b7ff);
    }

    .rotori-chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 5px;
    }

    .rotori-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      max-width: 100%;
      font-size: 10px;
      line-height: 1;
      font-weight: 900;
      padding: 5px 7px;
      border-radius: 999px;
      background: rgba(16,35,63,0.07);
      color: #10233f;
      border: 1px solid rgba(16,35,63,0.06);
      white-space: nowrap;
    }

    .rotori-chip-blue {
      background: rgba(22,131,255,0.12);
      color: #0962c5;
      border-color: rgba(22,131,255,0.20);
    }

    .rotori-chip-green {
      background: rgba(29,185,84,0.12);
      color: #16813f;
      border-color: rgba(29,185,84,0.20);
    }

    .rotori-chip-red {
      background: rgba(255,43,47,0.11);
      color: #c71318;
      border-color: rgba(255,43,47,0.18);
    }

    .rotori-chip-orange {
      background: rgba(255,145,0,0.13);
      color: #b35d00;
      border-color: rgba(255,145,0,0.20);
    }

    .rotori-chip-gray {
      background: rgba(16,35,63,0.07);
      color: #53647b;
    }

    .rotori-market-warning {
      margin-top: 7px;
      font-size: 10.5px;
      line-height: 1.2;
      font-weight: 800;
      color: #5a6a82;
      background: rgba(255,255,255,0.7);
      border: 1px dashed rgba(22,131,255,0.18);
      border-radius: 11px;
      padding: 6px 7px;
    }

    .rotori-clean-explanation .rotori-reason-card {
      padding: 9px 10px;
      border-radius: 15px;
      display: grid;
      grid-template-columns: 28px 1fr;
      gap: 8px;
    }

    .rotori-clean-explanation .rotori-reason-dot {
      width: 26px;
      height: 26px;
      font-size: 13px;
      box-shadow:
        inset 0 -2px 0 rgba(0,0,0,0.18),
        0 4px 8px rgba(22,131,255,0.22);
    }

    .rotori-clean-explanation .rotori-reason-text {
      font-size: 12px;
      line-height: 1.25;
    }

    #rotori-panel.rotori-dark .rotori-market-section {
      background: rgba(15, 23, 42, 0.96);
      border-color: rgba(148, 163, 184, 0.35);
      box-shadow:
        0 10px 24px rgba(0, 0, 0, 0.28),
        inset 0 -3px 0 rgba(0,0,0,0.16);
    }

    #rotori-panel.rotori-dark .rotori-market-section-header {
      background:
        linear-gradient(135deg, rgba(37, 99, 235, 0.22), rgba(255, 43, 47, 0.10)),
        #111827;
      border-bottom-color: rgba(148, 163, 184, 0.22);
    }

    #rotori-panel.rotori-dark .rotori-market-title {
      color: #f8fafc;
    }

    #rotori-panel.rotori-dark .rotori-market-item {
      background:
        linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.95));
      border-color: rgba(96, 165, 250, 0.24);
      box-shadow:
        inset 0 -2px 0 rgba(96, 165, 250, 0.08);
    }

    #rotori-panel.rotori-dark .rotori-market-item:hover {
      border-color: rgba(96, 165, 250, 0.45);
      box-shadow:
        inset 0 -2px 0 rgba(96, 165, 250, 0.10);
    }

    #rotori-panel.rotori-dark .rotori-market-item-projected {
      background:
        linear-gradient(135deg, rgba(255, 160, 35, 0.24), rgba(127, 29, 29, 0.24)),
        #1e293b !important;
      border-color: rgba(255, 145, 35, 0.75) !important;
    }

    #rotori-panel.rotori-dark .rotori-market-name {
      color: #f8fafc;
    }

    #rotori-panel.rotori-dark .rotori-market-thumb-wrap {
      background:
        radial-gradient(circle at 30% 20%, #334155, #0f172a);
      border-color: rgba(226, 232, 240, 0.28);
    }

    #rotori-panel.rotori-dark .rotori-market-warning {
      color: #cbd5e1;
      background: rgba(15, 23, 42, 0.78);
      border-color: rgba(96, 165, 250, 0.28);
    }

    #rotori-panel.rotori-dark .rotori-chip {
      background: rgba(255, 255, 255, 0.08);
      color: #e5e7eb;
      border-color: rgba(255, 255, 255, 0.08);
    }

    #rotori-panel.rotori-dark .rotori-chip-blue {
      background: rgba(59, 130, 246, 0.18);
      color: #bfdbfe;
      border-color: rgba(59, 130, 246, 0.24);
    }

    #rotori-panel.rotori-dark .rotori-chip-green {
      background: rgba(34, 197, 94, 0.16);
      color: #bbf7d0;
      border-color: rgba(34, 197, 94, 0.22);
    }

    #rotori-panel.rotori-dark .rotori-chip-red {
      background: rgba(248, 113, 113, 0.16);
      color: #fecaca;
      border-color: rgba(248, 113, 113, 0.22);
    }

    #rotori-panel.rotori-dark .rotori-chip-orange {
      background: rgba(251, 146, 60, 0.18);
      color: #fed7aa;
      border-color: rgba(251, 146, 60, 0.25);
    }

    #rotori-panel.rotori-dark .rotori-chip-gray {
      background: rgba(148, 163, 184, 0.14);
      color: #cbd5e1;
    }

    #rotori-panel.rotori-dark .rotori-clean-explanation .rotori-reason-card {
      background: #1e293b;
      border-color: rgba(96, 165, 250, 0.28);
    }

    #rotori-panel.rotori-dark .rotori-clean-explanation .rotori-reason-text {
      color: #f8fafc;
    }
  `;

  document.head.appendChild(style);
  injectRotoriSolidColorOverrides();
}

function rotoriFmt(value) {
  return Math.round(Number(value || 0)).toLocaleString();
}

function rotoriSafeNumber(value) {
  return Number(value || 0);
}

function rotoriAssetThumb(item) {
  if (item?.thumbnailUrl) return item.thumbnailUrl;

  const name = String(item?.name || "Limited")
    .replace(/[<>&'"]/g, "")
    .slice(0, 18);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#d9eeff"/>
        </linearGradient>
      </defs>
      <rect width="150" height="150" rx="28" fill="url(#g)"/>
      <circle cx="75" cy="58" r="28" fill="#1683ff" opacity="0.18"/>
      <text x="75" y="70" text-anchor="middle" font-size="34" font-family="Arial" font-weight="900" fill="#1683ff">R</text>
      <text x="75" y="106" text-anchor="middle" font-size="13" font-family="Arial" font-weight="800" fill="#10233f">${name}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function trendIcon(trend) {
  const t = String(trend || "").toUpperCase();

  if (t.includes("INCREAS") || t.includes("RISING")) return "↗";
  if (t.includes("LOWER") || t.includes("DROP")) return "↘";
  if (t.includes("STABLE") || t.includes("FAIR")) return "→";
  if (t.includes("LOW DEMAND")) return "!";
  return "?";
}

function demandIcon(demand) {
  const d = String(demand || "").toUpperCase();

  if (d.includes("ULTRA")) return "🔥";
  if (d.includes("HIGH")) return "⚡";
  if (d.includes("MED")) return "●";
  if (d.includes("LOW")) return "▼";
  return "?";
}

function chipClassForTrend(trend) {
  const t = String(trend || "").toUpperCase();

  if (t.includes("INCREAS") || t.includes("RISING")) return "rotori-chip-green";
  if (t.includes("LOWER") || t.includes("DROP")) return "rotori-chip-red";
  if (t.includes("LOW DEMAND")) return "rotori-chip-orange";
  if (t.includes("STABLE") || t.includes("FAIR")) return "rotori-chip-blue";
  return "rotori-chip-gray";
}

function chipClassForDemand(demand) {
  const d = String(demand || "").toUpperCase();

  if (d.includes("ULTRA") || d.includes("HIGH")) return "rotori-chip-green";
  if (d.includes("MED")) return "rotori-chip-blue";
  if (d.includes("LOW")) return "rotori-chip-orange";
  return "rotori-chip-gray";
}

function compactTrendText(trend) {
  const t = String(trend || "Unknown").replaceAll("_", " ");
  const u = t.toUpperCase();

  if (u.includes("NOT RISING")) return "Not rising";
  if (u.includes("SLIGHTLY")) return "Slight drop";
  if (u.includes("LOWERING")) return "Lowering";
  if (u.includes("INCREASING")) return "Rising";
  if (u.includes("STABLE")) return "Stable";
  if (u.includes("FAIR")) return "Stable";

  return t;
}
function rotoriIsValuedOverRap(item) {
  const isValued = !!item?.isValued;
  const rap = Number(item?.rap || item?.recentAveragePrice || 0);
  const value = Number(item?.baseValue || item?.value || 0);

  return isValued && value > 0 && rap >= value;
}

function rotoriIsValuedNearRaising(item) {
  const isValued = !!item?.isValued;
  const rap = Number(item?.rap || item?.recentAveragePrice || 0);
  const value = Number(item?.baseValue || item?.value || 0);

  if (!isValued || !value || rap >= value) return false;

  return value - rap <= Math.max(250, Math.round(value * 0.025));
}
function rotoriKnownText(value, type = "") {
  if (value === null || value === undefined) return "";

  // Roblox/Rolimons sometimes sends demand/trend as numbers.
  // Demand: 4 = ULTRA HIGH, 3 = HIGH, 2 = MEDIUM, 1 = LOW
  // Trend: 2+ = INCREASING, 1/0 = STABLE, -1 = SLIGHTLY LOWERING, -2 = LOWERING
  if (typeof value === "number") {
    if (type === "demand") {
      if (value >= 4) return "ULTRA HIGH";
      if (value === 3) return "HIGH";
      if (value === 2) return "MEDIUM";
      if (value === 1) return "LOW";
      return "";
    }

    if (type === "trend") {
      if (value >= 2) return "INCREASING";
      if (value === 1 || value === 0) return "STABLE";
      if (value === -1) return "SLIGHTLY LOWERING";
      if (value <= -2) return "LOWERING";
      return "";
    }
  }

  const text = String(value || "").replaceAll("_", " ").trim();
  const upper = text.toUpperCase();

  if (!text || upper === "UNKNOWN" || upper === "? UNKNOWN") {
    return "";
  }

  // Same fix, but for numbers that came through as strings.
  if (type === "demand") {
    if (upper === "4") return "ULTRA HIGH";
    if (upper === "3") return "HIGH";
    if (upper === "2") return "MEDIUM";
    if (upper === "1") return "LOW";
  }

  if (type === "trend") {
    if (upper === "2" || upper === "3" || upper === "4") return "INCREASING";
    if (upper === "1" || upper === "0") return "STABLE";
    if (upper === "-1") return "SLIGHTLY LOWERING";
    if (upper === "-2" || upper === "-3" || upper === "-4") return "LOWERING";
  }

  return text;
}
function rotoriDisplayTrend(item) {
  if (item?.noDemandReason) return "N/A";
  if (rotoriIsValuedOverRap(item)) return "Rising / Over RAP";
  if (rotoriIsValuedNearRaising(item)) return "Near Raising";

  return compactTrendText(
    rotoriKnownText(item?.marketTrend, "trend") ||
    rotoriKnownText(item?.trend, "trend") ||
    "Unknown"
  );
}

function rotoriDisplayDemand(item) {
  if (item?.noDemandReason) return "N/A";

  return (
    rotoriKnownText(item?.marketDemand, "demand") ||
    rotoriKnownText(item?.demand, "demand") ||
    "Unknown"
  );
}

function itemWarningText(item) {
  if (item?.noDemandReason) {
    return item.noDemandReason;
  }

  if (rotoriIsValuedOverRap(item)) {
    return "Over RAP — treated as raising. Good valued-piece signal.";
  }

  if (rotoriIsValuedNearRaising(item)) {
    return "Near RAP raise — this item is close to going over value.";
  }

  const warnings = [];

const trend = String(
  rotoriKnownText(item?.marketTrend, "trend") ||
  rotoriKnownText(item?.trend, "trend") ||
  ""
).toUpperCase();

const demand = String(
  rotoriKnownText(item?.marketDemand, "demand") ||
  rotoriKnownText(item?.demand, "demand") ||
  ""
).toUpperCase();
  const rapHealth = String(item?.rapHealth || "").toLowerCase();

  if (item?.projected || item?.isProjected) warnings.push("Projected risk");
  if (item?.isDropping) warnings.push("Dropping");
  if (demand.includes("LOW")) warnings.push("Low demand");
  if (trend.includes("LOWER") || trend.includes("DROP")) warnings.push("Weak trend");
  if (rapHealth.includes("critical")) warnings.push("Critical RAP gap");

  return warnings.length
    ? warnings.join(" • ")
    : "No major red flags from the quick read.";
}
let rotoriModalItemStore = new Map();
let rotoriModalItemCounter = 0;
let rotoriModalDelegationReady = false;

function injectRotoriItemModalStyles() {
  if (document.getElementById("rotori-item-modal-styles")) return;

  const style = document.createElement("style");
  style.id = "rotori-item-modal-styles";
  style.textContent = `
    .rotori-market-item-clickable {
      cursor: pointer;
    }

    .rotori-market-item-clickable::after {
      content: "View";
      position: absolute;
      right: 10px;
      bottom: 8px;
      font-size: 9px;
      font-weight: 900;
      color: rgba(22, 131, 255, 0.72);
      opacity: 0;
      transform: translateY(4px);
      transition: opacity 0.18s ease, transform 0.18s ease;
      pointer-events: none;
    }

    .rotori-market-item-clickable:hover::after {
      opacity: 1;
      transform: translateY(0);
    }

    .rotori-item-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 99999999;
      background: rgba(5, 13, 28, 0.42);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px;
      animation: rotori-modal-fade 0.18s ease both;
    }

    @keyframes rotori-modal-fade {
      from {
        opacity: 0;
      }

      to {
        opacity: 1;
      }
    }

    .rotori-item-modal {
      width: min(390px, calc(100vw - 32px));
      max-height: min(620px, calc(100vh - 38px));
      overflow: hidden;
      border-radius: 26px;
      background: #ffffff;
      border: 4px solid rgba(255,255,255,0.95);
      box-shadow:
        0 28px 70px rgba(0, 20, 60, 0.42),
        0 7px 0 rgba(0,0,0,0.10);
      font-family: "Fredoka", "Trebuchet MS", "Segoe UI", Arial, sans-serif;
      color: #10233f;
      animation: rotori-modal-pop 0.28s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @keyframes rotori-modal-pop {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.94);
      }

      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .rotori-item-modal-top {
      position: relative;
      padding: 13px 14px;
      background:
        radial-gradient(circle at 20% 10%, rgba(255,255,255,0.38), transparent 34%),
        linear-gradient(135deg, #ff2b2f 0%, #ff4f45 42%, #1683ff 100%);
      box-shadow: inset 0 -4px 0 rgba(0,0,0,0.10);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .rotori-item-modal-title-wrap {
      min-width: 0;
    }

    .rotori-item-modal-kicker {
      font-size: 10px;
      font-weight: 900;
      color: rgba(255,255,255,0.86);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      line-height: 1;
      margin-bottom: 5px;
    }

    .rotori-item-modal-title {
      font-size: 17px;
      line-height: 1;
      font-weight: 900;
      color: #ffffff;
      text-shadow:
        0 3px 0 rgba(0,0,0,0.14),
        0 8px 14px rgba(0,0,0,0.18);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 285px;
    }

    .rotori-item-modal-close {
      width: 34px;
      height: 34px;
      border: none;
      border-radius: 12px;
      background: rgba(0,0,0,0.18);
      color: #ffffff;
      font-size: 22px;
      font-weight: 900;
      line-height: 1;
      cursor: pointer;
      box-shadow:
        inset 0 -3px 0 rgba(0,0,0,0.16),
        0 3px 0 rgba(255,255,255,0.14);
      transition:
        transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1),
        filter 0.16s ease;
    }

    .rotori-item-modal-close:hover {
      transform: translateY(-2px) scale(1.06);
      filter: brightness(1.08);
    }

    .rotori-item-modal-body {
      max-height: calc(min(620px, 100vh - 38px) - 61px);
      overflow-y: auto;
      padding: 14px;
      background:
        radial-gradient(circle at 14px 14px, rgba(255,255,255,0.7) 2px, transparent 3px),
        linear-gradient(180deg, #edf7ff 0%, #ffffff 68%);
      background-size: 28px 28px, 100% 100%;
    }

    .rotori-item-modal-hero {
      display: grid;
      grid-template-columns: 94px 1fr;
      gap: 13px;
      align-items: center;
      padding: 12px;
      border-radius: 22px;
      background:
        linear-gradient(135deg, rgba(255,255,255,0.96), rgba(230,244,255,0.94));
      border: 1px solid rgba(22,131,255,0.16);
      box-shadow:
        0 10px 22px rgba(15, 55, 115, 0.13),
        inset 0 -3px 0 rgba(22,131,255,0.07);
    }

    .rotori-item-modal-thumb-wrap {
      width: 94px;
      height: 94px;
      border-radius: 24px;
      background:
        radial-gradient(circle at 30% 20%, #ffffff, #d9eeff);
      border: 3px solid #ffffff;
      box-shadow:
        0 11px 20px rgba(11,69,145,0.18),
        inset 0 -4px 0 rgba(0,0,0,0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .rotori-item-modal-thumb {
      width: 88px;
      height: 88px;
      object-fit: contain;
      filter: drop-shadow(0 6px 7px rgba(0,0,0,0.14));
    }

    .rotori-item-modal-bigtype {
      display: inline-flex;
      width: fit-content;
      font-size: 10px;
      line-height: 1;
      font-weight: 900;
      color: #ffffff;
      padding: 6px 8px;
      border-radius: 999px;
      background: #111111;
      box-shadow: inset 0 -2px 0 rgba(0,0,0,0.25);
      margin-bottom: 7px;
    }

    .rotori-item-modal-bigtype.value {
      background: linear-gradient(135deg, #ff2b2f, #ff8a2b);
    }

    .rotori-item-modal-bigtype.rap {
      background: linear-gradient(135deg, #1683ff, #00b7ff);
    }

    .rotori-item-modal-summary {
      font-size: 12px;
      line-height: 1.28;
      font-weight: 800;
      color: #53647b;
    }

    .rotori-item-modal-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 9px;
      margin-top: 12px;
    }

    .rotori-item-modal-stat {
      border-radius: 17px;
      background: rgba(255,255,255,0.9);
      border: 1px solid rgba(22,131,255,0.14);
      box-shadow:
        0 6px 14px rgba(15,55,115,0.08),
        inset 0 -2px 0 rgba(0,0,0,0.03);
      padding: 10px;
    }

    .rotori-item-modal-stat-label {
      font-size: 9px;
      font-weight: 900;
      color: #74849b;
      text-transform: uppercase;
      letter-spacing: 0.55px;
      line-height: 1;
      margin-bottom: 6px;
    }

    .rotori-item-modal-stat-value {
      font-size: 16px;
      font-weight: 900;
      color: #10233f;
      line-height: 1;
    }

    .rotori-item-modal-stat-sub {
      margin-top: 5px;
      font-size: 10.5px;
      font-weight: 800;
      color: #5f7089;
      line-height: 1.2;
    }

    .rotori-item-modal-section {
      margin-top: 12px;
      border-radius: 20px;
      background: rgba(255,255,255,0.92);
      border: 1px solid rgba(22,131,255,0.14);
      box-shadow:
        0 8px 18px rgba(15,55,115,0.08),
        inset 0 -2px 0 rgba(0,0,0,0.03);
      padding: 11px;
    }

    .rotori-item-modal-section-title {
      font-size: 12px;
      font-weight: 900;
      color: #10233f;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .rotori-item-modal-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .rotori-item-modal-note {
      font-size: 12px;
      line-height: 1.35;
      font-weight: 800;
      color: #53647b;
      background: rgba(22,131,255,0.08);
      border: 1px dashed rgba(22,131,255,0.22);
      border-radius: 14px;
      padding: 9px;
    }

    .rotori-item-modal-footer {
      margin-top: 10px;
      font-size: 10px;
      font-weight: 800;
      color: #7a8aa1;
      text-align: center;
    }
  `;

  document.head.appendChild(style);
  injectRotoriSolidColorOverrides();
}

function rotoriRegisterModalItem(item, side) {
  const key = `rotori-item-${++rotoriModalItemCounter}`;

  rotoriModalItemStore.set(key, {
    item,
    side
  });

  return key;
}

function ensureRotoriItemModalDelegation() {
  if (rotoriModalDelegationReady) return;
  rotoriModalDelegationReady = true;

  document.addEventListener("click", event => {
    const card = event.target.closest("[data-rotori-item-key]");

    if (!card) return;

    event.preventDefault();
    event.stopPropagation();

    rotoriOpenItemWindow(card.getAttribute("data-rotori-item-key"));
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      rotoriCloseItemWindow();
    }

    if (event.key !== "Enter" && event.key !== " ") return;

    const active = document.activeElement;

    if (!active?.matches?.("[data-rotori-item-key]")) return;

    event.preventDefault();
    rotoriOpenItemWindow(active.getAttribute("data-rotori-item-key"));
  });
}

function rotoriCloseItemWindow() {
  const old = document.getElementById("rotori-item-modal-backdrop");

  if (old) old.remove();
}

function rotoriMetricForModal(item) {
  const isValued = !!item?.isValued;
  const rap = rotoriSafeNumber(item?.rap || item?.recentAveragePrice);
  const value = rotoriSafeNumber(item?.baseValue || item?.value);

  return isValued
    ? {
        label: "Value",
        value: value,
        sub: `RAP ${rotoriFmt(rap)}`
      }
    : {
        label: "RAP",
        value: rap,
        sub: "RAP item"
      };
}

function rotoriOpForModal(item) {
  const isValued = !!item?.isValued;
  const op = rotoriSafeNumber(item?.overpay);
  const rapOp = rotoriSafeNumber(item?.rapOverpay);

  if (isValued) {
    return {
      label: "Value OP",
      value: op,
      sub: op ? "Manual OP setting" : "No set OP"
    };
  }

  return {
    label: "RAP OP",
    value: rapOp,
    sub: rapOp ? "Manual RAP OP" : "No set RAP OP"
  };
}

function rotoriOpenItemWindow(key) {
  injectRotoriItemModalStyles();

  const data = rotoriModalItemStore.get(key);
  if (!data?.item) return;

  rotoriCloseItemWindow();

  const item = data.item;
  const side = data.side;

  const isValued = !!item?.isValued;
  const metric = rotoriMetricForModal(item);
  const op = rotoriOpForModal(item);

  const demand = rotoriDisplayDemand(item);
const trend = rotoriDisplayTrend(item);

  const salesCount = rotoriSafeNumber(item?.salesCount);
  const latestSalePrice = rotoriSafeNumber(item?.latestSalePrice);
  const latestOldRap = rotoriSafeNumber(item?.latestOldRap);
  const latestNewRap = rotoriSafeNumber(item?.latestNewRap);

  const sideText = side === "giving" ? "Outgoing Item" : "Incoming Item";
  const sideIcon = side === "giving" ? "📤" : "📥";

  const backdrop = document.createElement("div");
  backdrop.id = "rotori-item-modal-backdrop";
  backdrop.className = "rotori-item-modal-backdrop";

  backdrop.innerHTML = `
    <div class="rotori-item-modal" role="dialog" aria-modal="true">
      <div class="rotori-item-modal-top">
        <div class="rotori-item-modal-title-wrap">
          <div class="rotori-item-modal-kicker">${sideIcon} ${escapeHTML(sideText)}</div>
          <div class="rotori-item-modal-title">${escapeHTML(item?.name || "Unknown Item")}</div>
        </div>

        <button class="rotori-item-modal-close" type="button" id="rotori-item-modal-close">×</button>
      </div>

      <div class="rotori-item-modal-body">
        <div class="rotori-item-modal-hero">
          <div class="rotori-item-modal-thumb-wrap">
            <img
              class="rotori-item-modal-thumb"
              src="${escapeHTML(rotoriAssetThumb(item))}"
              alt="${escapeHTML(item?.name || "Limited")}"
            >
          </div>

          <div>
            <div class="rotori-item-modal-bigtype ${isValued ? "value" : "rap"}">
              ${isValued ? "VALUED LIMITED" : "RAP LIMITED"}
            </div>

            <div class="rotori-item-modal-summary">
              ${escapeHTML(itemWarningText(item))}
            </div>
          </div>
        </div>

        <div class="rotori-item-modal-grid">
          <div class="rotori-item-modal-stat">
            <div class="rotori-item-modal-stat-label">${escapeHTML(metric.label)}</div>
            <div class="rotori-item-modal-stat-value">${rotoriFmt(metric.value)}</div>
            <div class="rotori-item-modal-stat-sub">${escapeHTML(metric.sub)}</div>
          </div>

          <div class="rotori-item-modal-stat">
            <div class="rotori-item-modal-stat-label">${escapeHTML(op.label)}</div>
            <div class="rotori-item-modal-stat-value">${rotoriFmt(op.value)}</div>
            <div class="rotori-item-modal-stat-sub">${escapeHTML(op.sub)}</div>
          </div>

          <div class="rotori-item-modal-stat">
            <div class="rotori-item-modal-stat-label">Demand</div>
            <div class="rotori-item-modal-stat-value">${demandIcon(demand)} ${escapeHTML(demand)}</div>
            <div class="rotori-item-modal-stat-sub">Sales frequency read</div>
          </div>

          <div class="rotori-item-modal-stat">
            <div class="rotori-item-modal-stat-label">Trend</div>
            <div class="rotori-item-modal-stat-value">${trendIcon(trend)} ${escapeHTML(trend)}</div>
            <div class="rotori-item-modal-stat-sub">Recent RAP movement</div>
          </div>
        </div>

        <div class="rotori-item-modal-section">
          <div class="rotori-item-modal-section-title">⚡ Statistics </div>

          <div class="rotori-item-modal-chips">
            <span class="rotori-chip ${chipClassForDemand(demand)}">${demandIcon(demand)} ${escapeHTML(demand)}</span>
            <span class="rotori-chip ${chipClassForTrend(trend)}">${trendIcon(trend)} ${escapeHTML(trend)}</span>
            <span class="rotori-chip ${item?.projected || item?.isProjected ? "rotori-chip-red" : "rotori-chip-green"}">
              ${item?.projected || item?.isProjected ? "🚨 Projected" : "✅ Not projected"}
            </span>
            <span class="rotori-chip rotori-chip-blue">🧾 ${salesCount ? rotoriFmt(salesCount) : "No"} sales read</span>
          </div>
        </div>

        <div class="rotori-item-modal-section">
          <div class="rotori-item-modal-section-title">📊 Sales Snapshot</div>

          <div class="rotori-item-modal-grid" style="margin-top:0;">
            <div class="rotori-item-modal-stat">
              <div class="rotori-item-modal-stat-label">Latest Sale</div>
              <div class="rotori-item-modal-stat-value">${latestSalePrice ? rotoriFmt(latestSalePrice) : "N/A"}</div>
              <div class="rotori-item-modal-stat-sub">Most recent parsed sale</div>
            </div>

            <div class="rotori-item-modal-stat">
              <div class="rotori-item-modal-stat-label">New RAP</div>
              <div class="rotori-item-modal-stat-value">${latestNewRap ? rotoriFmt(latestNewRap) : "N/A"}</div>
              <div class="rotori-item-modal-stat-sub">
                ${latestOldRap ? `Old RAP ${rotoriFmt(latestOldRap)}` : "No old RAP read"}
              </div>
            </div>
          </div>
        </div>

        <div class="rotori-item-modal-section">
          <div class="rotori-item-modal-section-title">🧠 Rotori Read</div>
          <div class="rotori-item-modal-note">
            ${escapeHTML(itemWarningText(item))}
          </div>
        </div>

        <div class="rotori-item-modal-footer">
          Click outside or press Esc to close.
        </div>
      </div>
    </div>
  `;

  backdrop.addEventListener("click", event => {
    if (event.target === backdrop) {
      rotoriCloseItemWindow();
    }
  });

  document.body.appendChild(backdrop);

  const closeBtn = document.getElementById("rotori-item-modal-close");

  if (closeBtn) {
    closeBtn.addEventListener("click", rotoriCloseItemWindow);
  }
}
function renderMarketItem(item, side) {
  injectRotoriItemModalStyles();
  ensureRotoriItemModalDelegation();

  const modalKey = rotoriRegisterModalItem(item, side);

  const isValued = !!item?.isValued;
  const rap = rotoriSafeNumber(item?.rap || item?.recentAveragePrice);
  const value = rotoriSafeNumber(item?.baseValue || item?.value);
  const op = rotoriSafeNumber(item?.overpay);
  const rapOp = rotoriSafeNumber(item?.rapOverpay);
const noDemandSet = !!item?.noDemandReason;

const trend = rotoriDisplayTrend(item);
const demand = rotoriDisplayDemand(item);
const isProjectedButton =
  !!(item?.projected || item?.isProjected || item?.isHyperInflated);
const overRapChip = rotoriIsValuedOverRap(item)
  ? `<span class="rotori-chip rotori-chip-green">🚀 Over RAP</span>`
  : rotoriIsValuedNearRaising(item)
    ? `<span class="rotori-chip rotori-chip-green">📈 Near raise</span>`
    : "";
  const salesCount = rotoriSafeNumber(item?.salesCount);
  const latestNewRap = rotoriSafeNumber(item?.latestNewRap);


  const metricText = isValued
    ? `Value ${rotoriFmt(value)}`
    : `RAP ${rotoriFmt(rap)}`;

  const opText = isValued
    ? (op ? `OP ${rotoriFmt(op)}` : "No OP")
    : (rapOp ? `RAP OP ${rotoriFmt(rapOp)}` : "No RAP OP");

  return `
    <div
  class="rotori-market-item rotori-market-item-clickable ${(item?.projected || item?.isProjected || item?.isHyperInflated) ? "rotori-market-item-projected" : ""}"
  data-rotori-item-key="${escapeHTML(modalKey)}"
  tabindex="0"
  role="button"
>
      <div class="rotori-market-thumb-wrap">
  <img
    class="rotori-market-thumb"
    src="${escapeHTML(rotoriAssetThumb(item))}"
    alt="${escapeHTML(item?.name || "Limited")}"
    loading="lazy"
  >
</div>

      <div class="rotori-market-main">
        <div class="rotori-market-topline">
          <div class="rotori-market-name">${escapeHTML(item?.name || "Unknown Item")}</div>
          <div class="rotori-market-type ${isValued ? "rotori-market-type-valued" : "rotori-market-type-rap"} ${isProjectedButton ? "rotori-market-type-projected" : ""}">
  ${isValued ? "VALUE" : "RAP"}
</div>
        </div>

        <div class="rotori-chip-row">
          <span class="rotori-chip rotori-chip-blue">💎 ${escapeHTML(metricText)}</span>
          <span class="rotori-chip rotori-chip-blue">➕ ${escapeHTML(opText)}</span>
          ${noDemandSet
  ? `<span class="rotori-chip rotori-chip-gray">🚫 No demand set</span>`
  : `
    <span class="rotori-chip ${chipClassForDemand(demand)}">${demandIcon(demand)} ${escapeHTML(demand)}</span>
    <span class="rotori-chip ${chipClassForTrend(trend)}">${trendIcon(trend)} ${escapeHTML(trend)}</span>
${overRapChip}
  `
}
          ${salesCount ? `<span class="rotori-chip rotori-chip-gray">🧾 ${rotoriFmt(salesCount)} sales</span>` : ""}
          ${latestNewRap ? `<span class="rotori-chip rotori-chip-gray">📈 New RAP ${rotoriFmt(latestNewRap)}</span>` : ""}
        </div>

        <div class="rotori-market-warning">
          ${escapeHTML(itemWarningText(item))}
        </div>
      </div>
    </div>
  `;
}
function renderMarketSection(title, icon, items, side) {
  const safeItems = Array.isArray(items) ? items : [];

  return `
    <div class="rotori-market-section">
      <div class="rotori-market-section-header">
        <div class="rotori-market-title">${icon} ${escapeHTML(title)}</div>
        <div class="rotori-market-count">${safeItems.length}</div>
      </div>

      <div class="rotori-market-list">
        ${safeItems.length
          ? safeItems.map(item => renderMarketItem(item, side)).join("")
          : `<div class="rotori-explainer-note">No items resolved on this side.</div>`
        }
      </div>
    </div>
  `;
}

function renderReasonText(reason) {
  const text = String(reason || "");
  const numberPattern = /([+-]?\d[\d,]*(?:\s?(?:OP|RAP))?)/g;

  let html = "";
  let lastIndex = 0;

  for (const match of text.matchAll(numberPattern)) {
    html += escapeHTML(text.slice(lastIndex, match.index));
    html += `<span class="rotori-reason-number">${escapeHTML(match[0])}</span>`;
    lastIndex = match.index + match[0].length;
  }

  html += escapeHTML(text.slice(lastIndex));

  return html;
}

function isItemDumpReason(reason) {
  const text = String(reason || "").toLowerCase();

  return (
    text.startsWith("outgoing ") ||
    text.startsWith("incoming ") ||
    text.includes("rap health:") ||
    (text.includes("demand:") && text.includes("trend:"))
  );
}

function renderReasons(reasons) {
  const cleanReasons = (reasons || []).filter(reason => !isItemDumpReason(reason));

  if (!cleanReasons.length) {
    return `
      <details class="rotori-details rotori-explanation rotori-clean-explanation" open>
        <summary>Trade Read</summary>
        <div class="rotori-details-content">
          <div class="rotori-explainer-note">
            Clean item cards handled the market read. No extra notes.
          </div>
        </div>
      </details>
    `;
  }

  return `
    <details class="rotori-details rotori-explanation rotori-clean-explanation" open>
      <summary>Trade Read</summary>
      <div class="rotori-details-content">
        <div class="rotori-explainer-note">
          Rotori's read.
        </div>

        ${cleanReasons.slice(0, 6).map((reason, index) => `
          <div class="rotori-reason-card" style="--i:${index}">
            <div class="rotori-reason-dot">${index + 1}</div>
            <div class="rotori-reason-text">${renderReasonText(reason)}</div>
          </div>
        `).join("")}
      </div>
    </details>
  `;
}

function renderTradeResult(response, giving, receiving) {
  injectRotoriMarketCardStyles();
  injectRotoriItemModalStyles();
  ensureRotoriItemModalDelegation();

  const verdict = response.verdict || "No verdict returned";

  const givingItems =
    response.givingItems ||
    response.giving ||
    [];

  const receivingItems =
    response.receivingItems ||
    response.receiving ||
    [];

  return `
    <div class="rotori-result-shell">
      <div class="rotori-verdict ${verdictClass(verdict)}">
        ${escapeHTML(verdict)}
      </div>

      <div class="rotori-stats">
        <div class="rotori-stat">
          <div class="rotori-stat-label">Type</div>
          <div class="rotori-stat-value">${escapeHTML(response.tradeType || "Unknown")}</div>
        </div>

        <div class="rotori-stat">
          <div class="rotori-stat-label">Difference</div>
          <div class="rotori-stat-value">${rotoriFmt(response.diff)}</div>
        </div>

        <div class="rotori-stat">
          <div class="rotori-stat-label">Giving</div>
          <div class="rotori-stat-value">${rotoriFmt(response.givingTotal)}</div>
        </div>

        <div class="rotori-stat">
          <div class="rotori-stat-label">Receiving</div>
          <div class="rotori-stat-value">${rotoriFmt(response.receivingTotal)}</div>
        </div>
      </div>

      ${renderMarketSection("Outgoing", "📤", givingItems, "giving")}
      ${renderMarketSection("Incoming", "📥", receivingItems, "receiving")}
      ${renderReasons(response.reasons)}
    </div>
  `;
}

async function sendTradeToRotori(giving, receiving, givingRobux = 0, receivingRobux = 0) {
  const response = await fetch("http://localhost:3000/analyze-trade", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      giving,
      receiving,
      givingRobux,
      receivingRobux
    })
  });

  return await response.json();
}
function rotoriNumberFromText(text, regex) {
  const match = String(text || "").match(regex);
  if (!match) return 0;
  return Number(String(match[1] || "").replace(/,/g, "")) || 0;
}

function prepareCounterResult(response) {
  const fixed = { ...response };

  if (
    fixed.counterMode &&
    fixed.counterMode !== "NO_SIMPLE_COUNTER" &&
    Number(fixed.counterTarget || 0) > 0
  ) {
    fixed.counterTarget = Number(fixed.counterTarget || 0);

    fixed.youOverpayBy =
      fixed.counterMode === "THEM_SMALL_ADD_OR_REPLACE"
        ? fixed.counterTarget
        : 0;

    fixed.missingOverpay =
      fixed.counterMode === "THEM_REPLACE_OR_ADD"
        ? fixed.counterTarget
        : 0;

    return fixed;
  }

  const givingTotal = Number(response?.givingTotal || 0);
  const receivingTotal = Number(response?.receivingTotal || 0);
  const diff = Number(response?.diff || 0);

  const text = [
    response?.verdict,
    response?.tradeType,
    ...(Array.isArray(response?.reasons) ? response.reasons : [])
  ].join(" ").toLowerCase();

  const tradeType = String(response?.tradeType || "").toUpperCase();

  fixed.counterMode = "NO_SIMPLE_COUNTER";
  fixed.counterTarget = 0;
  fixed.counterReason = "";
  fixed.youOverpayBy = 0;
  fixed.missingOverpay = 0;

  const needMore =
    rotoriNumberFromText(text, /counter for around\s+([\d,]+)\s+more/i) ||
    rotoriNumberFromText(text, /need around\s+([\d,]+)\s+more/i) ||
    rotoriNumberFromText(text, /need\s+([\d,]+)\s+more/i) ||
    rotoriNumberFromText(text, /would need around\s+([\d,]+)\s+more/i) ||
    rotoriNumberFromText(text, /short by\s+([\d,]+)/i);

  const overHardMax =
    rotoriNumberFromText(text, /over (?:the )?hard max by about\s+([\d,]+)/i) ||
    rotoriNumberFromText(text, /over (?:the )?hard max by\s+([\d,]+)/i);

  const wantedOp =
    rotoriNumberFromText(text, /want around\s+([\d,]+)\s*op/i) ||
    rotoriNumberFromText(text, /want you at\s+([\d,]+)\s*op/i) ||
    rotoriNumberFromText(text, /want you at\s+([\d,]+)\s*op or less/i);

  const currentOp = Math.abs(diff || givingTotal - receivingTotal);

  if (
    needMore > 0 ||
    tradeType.includes("PROJECTED") ||
    text.includes("incoming projected")
  ) {
    fixed.counterMode = "THEM_REPLACE_OR_ADD";
    fixed.counterTarget = needMore || wantedOp || currentOp;
    fixed.counterReason = "NEED_MORE_FOR_DOWNGRADE";
    fixed.missingOverpay = fixed.counterTarget;
    return fixed;
  }

  if (
    overHardMax > 0 ||
    text.includes("over the hard max") ||
    text.includes("too close to max") ||
    text.includes("too thin")
  ) {
    fixed.counterMode = "THEM_SMALL_ADD_OR_REPLACE";
    fixed.counterTarget = overHardMax || Math.max(0, currentOp - wantedOp);
    fixed.counterReason = "LOWER_OUR_OP_UNDER_MAX";
    fixed.youOverpayBy = fixed.counterTarget;
    return fixed;
  }

  return fixed;
}
async function getRotoriOwnerUser() {
  try {
    const res = await fetch("https://users.roblox.com/v1/users/authenticated", {
      method: "GET",
      credentials: "include"
    });

    if (!res.ok) return null;

    const user = await res.json();

    return {
      id: user.id,
      username: user.name,
      displayName: user.displayName
    };
  } catch {
    return null;
  }
}

function parseRobloxNumberLine(line) {
  const cleaned = String(line || "").replace(/,/g, "").trim();

  if (!/^\d+$/.test(cleaned)) return 0;

  return Number(cleaned) || 0;
}

function rotoriParseRobuxFromSideText(sideText, isOutgoingSide) {
  const text = String(sideText || "");

  const labelMatch = text.match(/Robux Offered\s*\(After\s*30%\s*fee\):?/i);
  if (!labelMatch) return 0;

  // Roblox can put the "70" on another line/column after the label.
  // So grab the first number shortly after the label instead of requiring same-line.
  const afterLabel = text.slice(labelMatch.index + labelMatch[0].length, labelMatch.index + labelMatch[0].length + 220);

  const numberMatch = afterLabel.match(/([\d,]+)/);
  if (!numberMatch) return 0;

  const afterFee = Number(numberMatch[1].replace(/,/g, "")) || 0;

  // Outgoing Robux: page shows after-fee, but trade total uses gross.
  // Example: 70 after fee = 100 offered.
  if (isOutgoingSide) {
    return Math.round(afterFee / 0.7);
  }

  // Incoming Robux: you only receive after-fee.
  return afterFee;
}

function parseTradeItemsWithRap(rawText) {
  const lines = String(rawText || "")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => !/^Total Value/i.test(line))
    .filter(line => !/^Robux Offered/i.test(line))
    .filter(line => !/^After 30% fee/i.test(line))
    .filter(line => !/^Accept$/i.test(line))
    .filter(line => !/^Counter$/i.test(line))
    .filter(line => !/^Decline$/i.test(line))
    .filter(line => line !== "#")
    .filter(line => line !== "↗")
    .filter(line => line !== "⌾")
    .filter(line => line !== "⏣");

  const items = [];
  let nameParts = [];

  for (const line of lines) {
    const num = parseRobloxNumberLine(line);

    if (num > 0) {
      if (nameParts.length) {
        const name = nameParts.join(" ").replace(/\s+/g, " ").trim();

        items.push({
          name,
          rap: num,
          value: num
        });

        nameParts = [];
      }

      continue;
    }

    if (/^[^\w\d]+$/.test(line)) continue;

    nameParts.push(line);
  }

  return items;
}

function rotoriNumberFromAnyText(text) {
  return Number(String(text || "").replace(/[^\d]/g, "")) || 0;
}

function rotoriGetSection(text, startRegex, endRegex) {
  const startMatch = text.match(startRegex);
  if (!startMatch) return "";

  const startIndex = startMatch.index + startMatch[0].length;
  const rest = text.slice(startIndex);

  const endMatch = rest.match(endRegex);
  const endIndex = endMatch ? endMatch.index : rest.length;

  return rest.slice(0, endIndex);
}

function rotoriVisibleTotalFromSection(sectionText) {
  const match = String(sectionText || "").match(/Total Value:\s*([\s\S]{0,120})/i);
  if (!match) return 0;

  const nums = String(match[1]).match(/[\d,]+/g) || [];
  if (!nums.length) return 0;

  return rotoriNumberFromAnyText(nums[0]);
}

function rotoriSumParsedItems(items) {
  return (items || []).reduce((sum, item) => {
    return sum + Number(item?.value || item?.rap || 0);
  }, 0);
}

async function scanInboundTrades() {
  const results = document.getElementById("rotori-results");
  const scanButton = document.getElementById("rotori-scan-btn");
  const btnText = scanButton?.querySelector(".rotori-btn-text");
  const btnIcon = scanButton?.querySelector(".rotori-btn-icon");

  const startedAt = performance.now();

  try {
    scanButton.disabled = true;
    scanButton.classList.add("rotori-scanning", "rotori-button-burst");

    setTimeout(() => {
      scanButton.classList.remove("rotori-button-burst");
    }, 450);

    if (btnText) btnText.textContent = "Analyzing Trade";
    if (btnIcon) btnIcon.textContent = "⟳";

    results.classList.remove("rotori-results-enter");

    results.innerHTML = `
      <div class="rotori-loading rotori-loading-fancy">
        <div class="rotori-spinner"></div>
        <div class="rotori-loading-title">Reading the trade</div>
        <div class="rotori-loading-subtitle">Give me a moment...</div>
        <div class="rotori-loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;

    const text = document.body.innerText;

    const giveMatch = text.match(/Items you will give([\s\S]*?)Total Value:/i);
    const receiveMatch = text.match(/Items you will receive([\s\S]*?)Total Value:/i);

    const givingRaw = giveMatch ? giveMatch[1].trim() : "";
    let receivingRaw = receiveMatch ? receiveMatch[1].trim() : "";

    const currentTradeText = text.slice(
      Math.max(0, text.search(/Trade with/i))
    );

    const givingBlock = rotoriGetSection(
      currentTradeText,
      /Items you will give/i,
      /Items you will receive/i
    );

    const receivingBlock = rotoriGetSection(
      currentTradeText,
      /Items you will receive/i,
      /(?:Accept|Counter|Send|Decline|$)/i
    );

    // Roblox already adds Robux Offered into the total,
    // so do not let the scanner treat Robux as an item.
    receivingRaw = receivingRaw
      .replace(/Robux Offered[\s\S]*$/i, "")
      .trim();

    const giving = cleanTradeItems(givingRaw);
    const receiving = cleanTradeItems(receivingRaw);
    const givingDetails = parseTradeItemsWithRap(givingRaw);
    const receivingDetails = parseTradeItemsWithRap(receivingRaw);

    const visibleGivingTotal = rotoriVisibleTotalFromSection(givingBlock);
    const visibleReceivingTotal = rotoriVisibleTotalFromSection(receivingBlock);

    const givingItemTotal = rotoriSumParsedItems(givingDetails);
    const receivingItemTotal = rotoriSumParsedItems(receivingDetails);

    const givingRobuxFromTotal = Math.max(0, visibleGivingTotal - givingItemTotal);
    const receivingRobuxFromTotal = Math.max(0, visibleReceivingTotal - receivingItemTotal);

    const givingRobuxFromLabel = rotoriParseRobuxFromSideText(givingBlock, true);
    const receivingRobuxFromLabel = rotoriParseRobuxFromSideText(receivingBlock, false);

    const givingRobux = Math.max(givingRobuxFromLabel, givingRobuxFromTotal);
    const receivingRobux = Math.max(receivingRobuxFromLabel, receivingRobuxFromTotal);

    console.log("ROT0RI ROBUX DEBUG:", {
      visibleGivingTotal,
      givingItemTotal,
      givingRobuxFromTotal,
      givingRobuxFromLabel,
      givingRobux,
      visibleReceivingTotal,
      receivingItemTotal,
      receivingRobux
    });

    if (!giving.length && !receiving.length) {
      throw new Error("No trade items found.");
    }

    const response = await sendTradeToRotori(giving, receiving, givingRobux, receivingRobux);

    const elapsed = performance.now() - startedAt;
    const minimumLoadingTime = 700;

    if (elapsed < minimumLoadingTime) {
      await new Promise(resolve => setTimeout(resolve, minimumLoadingTime - elapsed));
    }

    const counterReadyResponse = prepareCounterResult(response);
    const ownerUser = await getRotoriOwnerUser();

    results.innerHTML = renderTradeResult(response, giving, receiving);

    rotoriShowCounterButton(counterReadyResponse, {
      ownerUser,

      givingItems:
        response.givingItems ||
        response.givingDetails ||
        givingDetails ||
        giving.map(name => ({ name })),

      receivingItems:
        response.receivingItems ||
        response.receivingDetails ||
        receivingDetails ||
        receiving.map(name => ({ name }))
    });

requestAnimationFrame(() => {
  results.classList.add("rotori-results-enter");
});

console.log("ROT0RI RESPONSE:", response);
  } catch (err) {
    console.error("Rotori scan error:", err);

    results.classList.remove("rotori-results-enter");

    results.innerHTML = `
      <div class="rotori-result-shell">
        <div class="rotori-error">
          <b>Rotori error</b><br>
          ${escapeHTML(err.message || "Something went wrong.")}
        </div>
      </div>
    `;

    requestAnimationFrame(() => {
      results.classList.add("rotori-results-enter");
    });
  } finally {
    scanButton.disabled = false;
    scanButton.classList.remove("rotori-scanning");

    if (btnText) btnText.textContent = "Analyze Current Trade";
    if (btnIcon) btnIcon.textContent = "↗";
  }
}
function rotoriIsBadTrade(result) {
  const text = [
    result?.verdict,
    result?.status,
    result?.title,
    result?.explanation
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    text.includes("bad") ||
    text.includes("decline") ||
    text.includes("lose") ||
    text.includes("loss") ||
    text.includes("giving too much") ||
    text.includes("not enough") ||
    text.includes("missing") ||
    Number(result?.missingOverpay || 0) > 0 ||
    Number(result?.neededOverpay || 0) > 0 ||
    Number(result?.neededValue || 0) > 0 ||
    Number(result?.youOverpayBy || 0) > 0
  );
}

function rotoriEscapeHtml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function rotoriFormatCounterText(text) {
  return rotoriEscapeHtml(text).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

function rotoriFindPanel() {
  return (
    document.querySelector("#rotori-results .rotori-result-shell") ||
    document.querySelector("#rotori-results")
  );
}

function rotoriShowCounterButton(result, tradeData) {
  const panel = rotoriFindPanel();

  if (!panel) {
    console.warn("[Rotori] Could not find panel for counter button.");
    return;
  }

  document.querySelector("#rotori-counter-wrap")?.remove();

  if (!rotoriIsBadTrade(result)) return;

  const wrap = document.createElement("div");
  wrap.id = "rotori-counter-wrap";
  wrap.style.marginTop = "12px";

  wrap.innerHTML = `
    <button id="rotori-counter-btn" style="
      width: 100%;
      border: none;
      outline: none;
      cursor: pointer;
      padding: 11px 12px;
      border-radius: 12px;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: white;
      font-weight: 800;
      font-size: 14px;
      box-shadow: 0 8px 20px rgba(37, 99, 235, 0.28);
    ">
      Counter This Trade
    </button>

    <div id="rotori-counter-box" style="
      display: none;
      margin-top: 10px;
      padding: 12px;
      border-radius: 12px;
      background: rgba(15, 23, 42, 0.92);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: white;
      font-size: 13px;
      line-height: 1.45;
    "></div>
  `;

  panel.appendChild(wrap);

  const btn = wrap.querySelector("#rotori-counter-btn");
  const box = wrap.querySelector("#rotori-counter-box");

  btn.addEventListener("click", async () => {
    try {
      btn.disabled = true;
      btn.textContent = "Scanning inventory...";
      btn.style.opacity = "0.75";

      box.style.display = "block";
      box.innerHTML = `
        <strong>Finding a counter...</strong><br>
        Checking their collectibles and looking for a safe add.
      `;

      if (!window.RotoriCounter?.suggestCounter) {
  throw new Error("RotoriCounter is not loaded. Check manifest.json file order.");
}

const counter = await window.RotoriCounter.suggestCounter({
  analyzeResult: result,
  givingItems: tradeData?.givingItems || [],
  receivingItems: tradeData?.receivingItems || [],
  ownerUser: tradeData?.ownerUser || null
});

      box.innerHTML = `
        <strong>${rotoriEscapeHtml(counter.title || "Suggested Counter")}</strong>
        <div style="margin-top: 6px;">
          ${rotoriFormatCounterText(counter.text || "No counter suggestion found.")}
        </div>
      `;

      btn.textContent = "Refresh Counter";
    } catch (err) {
      console.error("[Rotori Counter Error]", err);

      box.style.display = "block";
      box.innerHTML = `
        <strong>Counter failed</strong>
        <div style="margin-top: 6px;">
          ${rotoriEscapeHtml(err.message || "Could not create a counter suggestion.")}
        </div>
      `;

      btn.textContent = "Try Again";
    } finally {
      btn.disabled = false;
      btn.style.opacity = "1";
    }
  });
}

function bootRotori() {
  if (!isInboundTradesPage()) return;
  createRotoriPanel();
}

bootRotori();

let lastUrl = location.href;
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    bootRotori();
  }
}, 1000);
