import React, { FC, useEffect, useState } from 'react';
import { gameService, SaveGameSummary } from '../services/gameService';
import './LoadGameModal.css';

interface LoadGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (gameId: number) => void;
}

export const LoadGameModal: FC<LoadGameModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [saves, setSaves] = useState<SaveGameSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchSaves = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await gameService.listGames();
        setSaves(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Failed to load saves');
      } finally {
        setLoading(false);
      }
    };
    fetchSaves();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="load-modal-overlay">
      <div className="load-modal">
        <div className="load-modal__header">
          <h2>Load Saved Town</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {loading && <div className="load-modal__status">Loading saves...</div>}
        {error && <div className="load-modal__error">{error}</div>}

        {!loading && !error && (
          saves.length === 0 ? (
            <div className="load-modal__status">No saved games found.</div>
          ) : (
            <div className="save-grid">
              {saves.map((save) => (
                <div key={save.id} className="save-card">
                  <div className="save-card__title">{save.hero_name}</div>
                  <div className="save-card__meta">
                    <span>{save.hero_class}</span>
                    <span>{save.hero_race}</span>
                    <span>Lvl {save.level}</span>
                  </div>
                  <div className="save-card__timestamps">
                    <div><strong>Created:</strong> {new Date(save.created_at).toLocaleString()}</div>
                    <div><strong>Updated:</strong> {new Date(save.updated_at).toLocaleString()}</div>
                  </div>
                  <button className="load-btn" onClick={() => onSelect(save.id)}>
                    Load This Town
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};
