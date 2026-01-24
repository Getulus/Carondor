"""Game race definitions"""

from enum import Enum
from dataclasses import dataclass


class RaceType(Enum):
    HUMAN = "Human"
    ELF = "Elf"
    DWARF = "Dwarf"
    ORC = "Orc"
    UNDEAD = "Undead"
    DRAGONBORN = "Dragonborn"


@dataclass
class Race:
    """Race definition with bonus stats"""
    name: str
    physical_bonus: int
    magical_bonus: int
    health_bonus: int
    description: str

    def to_dict(self):
        return {
            "name": self.name,
            "physical_bonus": self.physical_bonus,
            "magical_bonus": self.magical_bonus,
            "health_bonus": self.health_bonus,
            "description": self.description
        }


# Race definitions
RACES = {
    RaceType.HUMAN: Race(
        name="Human",
        physical_bonus=2,
        magical_bonus=2,
        health_bonus=5,
        description="Versatile and adaptable, humans are well-rounded warriors."
    ),
    RaceType.ELF: Race(
        name="Elf",
        physical_bonus=1,
        magical_bonus=4,
        health_bonus=0,
        description="Graceful and magical, elves excel at spellcasting."
    ),
    RaceType.DWARF: Race(
        name="Dwarf",
        physical_bonus=3,
        magical_bonus=0,
        health_bonus=8,
        description="Sturdy and resilient, dwarves are masters of defense."
    ),
    RaceType.ORC: Race(
        name="Orc",
        physical_bonus=5,
        magical_bonus=0,
        health_bonus=6,
        description="Brutal and powerful, orcs dominate physical combat."
    ),
    RaceType.UNDEAD: Race(
        name="Undead",
        physical_bonus=2,
        magical_bonus=3,
        health_bonus=10,
        description="Dark and cursed, the undead are immune to death magic."
    ),
    RaceType.DRAGONBORN: Race(
        name="Dragonborn",
        physical_bonus=4,
        magical_bonus=3,
        health_bonus=4,
        description="Descendants of dragons, dragonborns are proud warriors."
    ),
}
