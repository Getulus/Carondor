"""Hero (player character) model"""

from dataclasses import dataclass, field
from datetime import datetime
from .classes import GameClass
from .races import Race


@dataclass
class Hero:
    """Player character with name, class, race, and stats"""
    name: str
    game_class: GameClass
    race: Race
    level: int = 1
    experience: int = 0
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())

    @property
    def health_point(self) -> int:
        return self.game_class.health_point + self.race.health_bonus

    @property
    def physical_attack(self) -> int:
        return self.game_class.physical_attack + self.race.physical_bonus

    @property
    def physical_defense(self) -> int:
        return self.game_class.physical_defense + self.race.physical_bonus

    @property
    def magical_attack(self) -> int:
        return self.game_class.magical_attack + self.race.magical_bonus

    @property
    def magical_defense(self) -> int:
        return self.game_class.magical_defense + self.race.magical_bonus

    def to_dict(self):
        return {
            "name": self.name,
            "class": self.game_class.name,
            "race": self.race.name,
            "level": self.level,
            "experience": self.experience,
            "stats": {
                "health_point": self.health_point,
                "physical_attack": self.physical_attack,
                "physical_defense": self.physical_defense,
                "magical_attack": self.magical_attack,
                "magical_defense": self.magical_defense,
            },
            "created_at": self.created_at
        }
