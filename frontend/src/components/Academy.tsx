import React, { useEffect, useState } from 'react';
import { getTalents, investTalent, refundTalent, TalentData } from '../services/academyService';
import './Academy.css';

interface AcademyProps {
  gameId: number;
}

const Academy: React.FC<AcademyProps> = ({ gameId }) => {
  const [talentData, setTalentData] = useState<TalentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadTalents();
  }, [gameId]);

  const loadTalents = async () => {
    try {
      setLoading(true);
      const data = await getTalents(gameId);
      setTalentData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Academy');
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async (talentId: string) => {
    try {
      await investTalent(gameId, talentId);
      await loadTalents();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to invest talent');
    }
  };

  const handleRefund = async (talentId: string) => {
    if (!window.confirm('Refunding costs gold. Are you sure?')) {
      return;
    }
    try {
      await refundTalent(gameId, talentId);
      await loadTalents();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to refund talent');
    }
  };

  if (loading) {
    return <div className="academy-loading">Loading Academy...</div>;
  }

  if (error) {
    return (
      <div className="academy-error">
        <h3>⚠️ {error}</h3>
        {error.includes('Academy not built') && (
          <p>Build an Academy in the Buildings tab to unlock the talent system!</p>
        )}
      </div>
    );
  }

  if (!talentData) {
    return <div className="academy-error">No talent data available</div>;
  }

  // Get current level of a talent
  const getTalentLevel = (talentId: string): number => {
    const invested = talentData.talents.find(t => t.talent_id === talentId);
    return invested ? invested.level : 0;
  };

  // Group talents by category
  const economyTalents = talentData.available_talents.filter(t => t.category === 'economy');
  const militaryTalents = talentData.available_talents.filter(t => t.category === 'military');
  const specialTalents = talentData.available_talents.filter(t => t.category === 'special');

  const categories = [
    { id: 'all', name: 'All Talents', talents: talentData.available_talents },
    { id: 'economy', name: '💰 Economy', talents: economyTalents },
    { id: 'military', name: '⚔️ Military', talents: militaryTalents },
    { id: 'special', name: '✨ Special', talents: specialTalents },
  ];

  const displayedTalents = selectedCategory === 'all' 
    ? talentData.available_talents 
    : categories.find(c => c.id === selectedCategory)?.talents || [];

  return (
    <div className="academy-container">
      <div className="academy-header">
        <h2>🎓 Academy - Talent System</h2>
        <div className="talent-points-display">
          <div className="points-bar">
            <div 
              className="points-used" 
              style={{ width: `${(talentData.talent_points_used / talentData.talent_points_total) * 100}%` }}
            />
          </div>
          <div className="points-text">
            <span className="points-remaining">{talentData.talent_points_remaining}</span>
            <span className="points-separator">/</span>
            <span className="points-total">{talentData.talent_points_total}</span>
            <span className="points-label">Talent Points Available</span>
          </div>
          <p className="points-info">Earn 2 talent points per hero level</p>
        </div>
      </div>

      <div className="academy-categories">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name} ({cat.talents.length})
          </button>
        ))}
      </div>

      <div className="talents-grid">
        {displayedTalents.map(talent => {
          const currentLevel = getTalentLevel(talent.talent_id);
          const isMaxed = currentLevel >= talent.max_level;
          const canAfford = talentData.talent_points_remaining >= talent.cost_per_level;
          const canInvest = !isMaxed && canAfford;

          return (
            <div key={talent.talent_id} className={`talent-card ${isMaxed ? 'maxed' : ''}`}>
              <div className="talent-header">
                <h3>{talent.name}</h3>
                <div className="talent-level">
                  {currentLevel} / {talent.max_level}
                </div>
              </div>

              <p className="talent-description">{talent.description}</p>

              <div className="talent-cost">
                <strong>Cost:</strong> {talent.cost_per_level} point{talent.cost_per_level > 1 ? 's' : ''} per level
              </div>

              {currentLevel > 0 && (
                <div className="talent-current-bonus">
                  <strong>Current Bonus:</strong>
                  <ul>
                    {Object.entries(talent.bonus).map(([key, value]) => (
                      <li key={key}>
                        {formatBonusName(key)}: +{(value * currentLevel * 100).toFixed(0)}
                        {key.includes('multiplier') ? '%' : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="talent-actions">
                <button
                  onClick={() => handleInvest(talent.talent_id)}
                  disabled={!canInvest}
                  className="invest-btn"
                  title={!canAfford ? 'Not enough talent points' : isMaxed ? 'Already maxed' : 'Invest point'}
                >
                  {isMaxed ? '✓ Maxed' : `⬆ Invest (${talent.cost_per_level})`}
                </button>
                
                {currentLevel > 0 && (
                  <button
                    onClick={() => handleRefund(talent.talent_id)}
                    className="refund-btn"
                    title={`Refund 1 level (costs ${talent.cost_per_level * 100} gold)`}
                  >
                    ⬇ Refund
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {displayedTalents.length === 0 && (
        <div className="no-talents">
          <p>No talents in this category</p>
        </div>
      )}
    </div>
  );
};

function formatBonusName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace('multiplier', '')
    .replace('bonus', '')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default Academy;
