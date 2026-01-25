import React, { useState, useEffect, FC } from 'react';
import { GameClass, Race, HeroCreationData } from '../services/gameService';
import imageUtils from '../utils/imageUtils';
import '../styles/CharacterCreation.css';

interface CharacterCreationProps {
  classes: GameClass[];
  races: Race[];
  onHeroCreated: (heroData: HeroCreationData) => void;
  onCancel: () => void;
}

type CreationStep = 'name' | 'class' | 'race' | 'review';

const CharacterCreation: FC<CharacterCreationProps> = ({
  classes,
  races,
  onHeroCreated,
  onCancel,
}) => {
  const [heroName, setHeroName] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedRace, setSelectedRace] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<CreationStep>('name');

  useEffect(() => {
    if (classes.length > 0 && selectedClass === '') {
      setSelectedClass(classes[0].name);
    }
  }, [classes, selectedClass]);

  useEffect(() => {
    if (races.length > 0 && selectedRace === '') {
      setSelectedRace(races[0].name);
    }
  }, [races, selectedRace]);

  const handleNext = (): void => {
    if (currentStep === 'name' && heroName.trim()) {
      setCurrentStep('class');
    } else if (currentStep === 'class' && selectedClass) {
      setCurrentStep('race');
    } else if (currentStep === 'race' && selectedRace) {
      setCurrentStep('review');
    }
  };

  const handlePrev = (): void => {
    if (currentStep === 'class') setCurrentStep('name');
    else if (currentStep === 'race') setCurrentStep('class');
    else if (currentStep === 'review') setCurrentStep('race');
  };

  const handleCreate = (): void => {
    onHeroCreated({
      name: heroName,
      class: selectedClass,
      race: selectedRace,
    });
  };

  const selectedClassData = classes.find((c) => c.name === selectedClass);
  const selectedRaceData = races.find((r) => r.name === selectedRace);

  return (
    <div className="character-creation">
      <div className="creation-container">
        <h1>Create Your Hero</h1>

        {/* Step 1: Name */}
        {currentStep === 'name' && (
          <div className="step">
            <h2>What is your hero's name?</h2>
            <input
              type="text"
              value={heroName}
              onChange={(e) => setHeroName(e.target.value)}
              placeholder="Enter hero name"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && heroName.trim() && handleNext()}
            />
          </div>
        )}

        {/* Step 2: Class Selection */}
        {currentStep === 'class' && (
          <div className="step">
            <h2>Choose Your Class</h2>
            <div className="options-grid">
              {classes.map((cls) => (
                <div
                  key={cls.name}
                  className={`option-card ${selectedClass === cls.name ? 'selected' : ''}`}
                  onClick={() => setSelectedClass(cls.name)}
                >
                  <div className="option-image">
                    <img 
                      src={imageUtils.getHeroPlaceholder(cls.name)}
                      alt={cls.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23333'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='white' font-size='12'%3E${cls.name}%3C/text%3E%3C/svg%3E`;
                      }}
                    />
                  </div>
                  <h3>{cls.name}</h3>
                  <p className="description">{cls.description}</p>
                  <div className="stats">
                    <div>❤️ HP: {cls.health_point}</div>
                    <div>⚔️ P.Atk: {cls.physical_attack}</div>
                    <div>🛡️ P.Def: {cls.physical_defense}</div>
                    <div>✨ M.Atk: {cls.magical_attack}</div>
                    <div>✨ M.Def: {cls.magical_defense}</div>
                  </div>
                </div>
              ))}
            </div>
            {selectedClassData && (
              <div className="selected-info">
                <p>You selected: <strong>{selectedClassData.name}</strong></p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Race Selection */}
        {currentStep === 'race' && (
          <div className="step">
            <h2>Choose Your Race (Town Race)</h2>
            <div className="options-grid">
              {races.map((race) => (
                <div
                  key={race.name}
                  className={`option-card ${selectedRace === race.name ? 'selected' : ''}`}
                  onClick={() => setSelectedRace(race.name)}
                >
                  <div className="option-image">
                    <img 
                      src={imageUtils.getRaceImage(race.name)}
                      alt={race.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23333'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='white' font-size='12'%3E${race.name}%3C/text%3E%3C/svg%3E`;
                      }}
                    />
                  </div>
                  <h3>{race.name}</h3>
                  <p className="description">{race.description}</p>
                  <div className="bonuses">
                    <div>⚔️ Physical: +{race.physical_bonus}</div>
                    <div>✨ Magical: +{race.magical_bonus}</div>
                    <div>❤️ Health: +{race.health_bonus}</div>
                  </div>
                </div>
              ))}
            </div>
            {selectedRaceData && (
              <div className="selected-info">
                <p>Your town will be: <strong>{selectedRaceData.name}</strong></p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 'review' && (
          <div className="step review">
            <h2>Confirm Your Hero</h2>
            <div className="review-card">
              <h3>{heroName}</h3>
              <div className="review-info">
                <p><strong>Class:</strong> {selectedClass}</p>
                <p><strong>Race (Town):</strong> {selectedRace}</p>
              </div>
              <div className="final-stats">
                <h4>Final Stats:</h4>
                {selectedClassData && selectedRaceData && (
                  <div>
                    <div>❤️ Health: {selectedClassData.health_point + selectedRaceData.health_bonus}</div>
                    <div>⚔️ Physical Attack: {selectedClassData.physical_attack + selectedRaceData.physical_bonus}</div>
                    <div>🛡️ Physical Defense: {selectedClassData.physical_defense + selectedRaceData.physical_bonus}</div>
                    <div>✨ Magical Attack: {selectedClassData.magical_attack + selectedRaceData.magical_bonus}</div>
                    <div>✨ Magical Defense: {selectedClassData.magical_defense + selectedRaceData.magical_bonus}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="buttons-container">
          {currentStep !== 'name' && (
            <button className="btn-secondary" onClick={handlePrev}>
              ← Back
            </button>
          )}
          {currentStep !== 'review' && (
            <button
              className="btn-primary"
              onClick={handleNext}
              disabled={
                (currentStep === 'name' && !heroName.trim()) ||
                (currentStep === 'class' && !selectedClass) ||
                (currentStep === 'race' && !selectedRace)
              }
            >
              Next →
            </button>
          )}
          {currentStep === 'review' && (
            <>
              <button className="btn-primary" onClick={handleCreate}>
                Create Hero
              </button>
            </>
          )}
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreation;
