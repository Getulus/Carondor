"""Game class definitions and properties"""

from enum import Enum
from dataclasses import dataclass


class ClassType(Enum):
    WARRIOR = "Warrior"
    SORCERER = "Sorcerer"
    PALADIN = "Paladin"
    DRUID = "Druid"
    SHADOW_HUNTER = "ShadowHunter"
    BANDIT = "Bandit"


@dataclass
class GameClass:
    """Base class for all character classes with common properties"""
    name: str
    health_point: int
    physical_attack: int
    physical_defense: int
    magical_attack: int
    magical_defense: int
    description: str

    def to_dict(self):
        return {
            "name": self.name,
            "health_point": self.health_point,
            "physical_attack": self.physical_attack,
            "physical_defense": self.physical_defense,
            "magical_attack": self.magical_attack,
            "magical_defense": self.magical_defense,
            "description": self.description
        }


# Class definitions with balanced stats
CLASSES = {
    ClassType.WARRIOR: GameClass(
        name="Warrior",
        health_point=150,
        physical_attack=25,
        physical_defense=20,
        magical_attack=5,
        magical_defense=10,
        description="A master of melee combat with high health and physical defense."
    ),
    ClassType.SORCERER: GameClass(
        name="Sorcerer",
        health_point=80,
        physical_attack=8,
        physical_defense=8,
        magical_attack=30,
        magical_defense=15,
        description="A wielder of magical power with strong spell attacks."
    ),
    ClassType.PALADIN: GameClass(
        name="Paladin",
        health_point=130,
        physical_attack=18,
        physical_defense=25,
        magical_attack=12,
        magical_defense=20,
        description="A holy warrior balancing physical and magical abilities."
    ),
    ClassType.DRUID: GameClass(
        name="Druid",
        health_point=110,
        physical_attack=15,
        physical_defense=12,
        magical_attack=20,
        magical_defense=18,
        description="A healer and nature user with balanced stats."
    ),
    ClassType.SHADOW_HUNTER: GameClass(
        name="ShadowHunter",
        health_point=100,
        physical_attack=22,
        physical_defense=12,
        magical_attack=18,
        magical_defense=12,
        description="A mysterious hunter dealing both physical and shadow magic damage."
    ),
    ClassType.BANDIT: GameClass(
        name="Bandit",
        health_point=95,
        physical_attack=28,
        physical_defense=10,
        magical_attack=8,
        magical_defense=8,
        description="A nimble rogue with high physical attack and low defense."
    ),
}
