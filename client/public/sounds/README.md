# Audio Assets for Havoc Speedway

This directory contains all audio files for the game. The SoundManager system loads these files dynamically.

## Directory Structure

- `ui/` - User interface sounds (button clicks, notifications, errors)
- `cards/` - Card game sounds (flip, deal, shuffle, select)
- `stages/` - Game stage sounds (dealer selection, storm events, racing)
- `racing/` - Racing-specific sounds (gallop, neigh, crowd, finish line)
- `music/` - Background music tracks (lobby, game, racing themes)

## Sound File Requirements

All files should be in MP3 format for broad browser compatibility. Files should be:
- High quality (44.1kHz, 16-bit minimum)
- Compressed for web delivery
- Looping tracks should have seamless loops
- Short UI sounds should be under 1 second
- Music tracks should be 2-4 minutes with seamless loops

## Professional Sound Design Guidelines

1. **Consistency**: All sounds should fit the game's theme and atmosphere
2. **Accessibility**: Provide visual alternatives for important audio cues
3. **Volume**: Normalize all sounds to appropriate levels
4. **Performance**: Optimize file sizes without sacrificing quality
5. **Fallbacks**: System gracefully handles missing audio files

## Implementation Status

The SoundManager system is fully implemented and ready for audio files:
- ✅ Audio loading and error handling
- ✅ Category-based volume controls (Music, SFX, UI)
- ✅ User preference persistence
- ✅ Integration with game events
- ⏳ Actual audio files (placeholder structure created)

## Next Steps

1. Source or create professional-quality audio assets
2. Implement sounds for all defined game events
3. Add audio settings panel to game UI
4. Test audio performance and accessibility
