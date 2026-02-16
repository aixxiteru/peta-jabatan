import React from 'react';
import './StatusCard.css';
import './StatusCard.align-fix.css';

interface StatusCardProps {
  icon: React.ReactNode;
  title: string;
  mainValue: number;
  kebutuhan: number;
  shortage: number;
  barColor: string;
  shortageBarColor?: string;
  onShortageClick?: () => void;
}

const StatusCard: React.FC<StatusCardProps> = ({
  icon,
  title,
  mainValue,
  kebutuhan,
  shortage,
  barColor,
  shortageBarColor = '#e5e7eb',
  onShortageClick,
}) => {
  // Calculate bar width (simple, for demo)
  const total = kebutuhan + shortage;
  const kebutuhanPercent = total ? (kebutuhan / total) * 100 : 100;
  const shortagePercent = total ? (shortage / total) * 100 : 0;

  return (
    <div className="status-card">
      <div className="status-card__icon">{icon}</div>
      <div className="status-card__title">{title}</div>
      <div className="status-card__main-value">{mainValue}</div>
      <div className="status-card__info-row">
        <span className="status-card__info-label">KEBUTUHAN</span>
        <span className="status-card__info-value available">{kebutuhan}</span>
      </div>
      <div className="status-card__info-row">
        <span className="status-card__info-label">KEKURANGAN</span>
        {onShortageClick && shortage > 0 ? (
          <button
            className="status-card__info-value shortage status-card__shortage-btn"
            onClick={onShortageClick}
            title="Klik untuk lihat detail kekurangan"
            type="button"
          >
            {shortage}
          </button>
        ) : (
          <span className="status-card__info-value shortage">{shortage}</span>
        )}
      </div>
      <div className="status-card__bar">
        <div
          className="status-card__bar-available"
          style={{ width: `${kebutuhanPercent}%`, background: barColor }}
        />
        <div
          className="status-card__bar-shortage"
          style={{ width: `${shortagePercent}%`, background: shortageBarColor }}
        />
      </div>
    </div>
  );
};

export default StatusCard;
