# 🔬 Dynamic Scaling Demo & Test Guide

## Quick Start Test

### 1. Basic Dynamic Scaling Test
1. Open Mindmap Editor
2. Create a new block with short text: "Test"
3. Start editing the block
4. Gradually add more content:
   ```
   Test
   Test with more content
   Test with much more content that should trigger scaling
   Test with extensive content that will definitely cause the block to grow significantly and trigger neighbor repositioning
   ```
5. **Expected Behavior:**
   - Block grows smoothly as you type
   - Blue pulsing effect appears during scaling
   - Toolbar shows "Scaling 1 block" indicator

### 2. Neighbor Repositioning Test
1. Create 3-4 blocks close together:
   - Block A: "Short"
   - Block B: "Also short" (place near Block A)
   - Block C: "Brief" (place near both A and B)
2. Edit Block A and expand it significantly:
   ```
   This is now a much larger block with extensive content that will grow significantly beyond its original size and should trigger the intelligent neighbor repositioning system to move the nearby blocks automatically
   ```
3. **Expected Behavior:**
   - Blocks B and C glow orange and move away
   - Staggered animation (closer blocks move first)
   - Notification: "Repositioned X neighbor blocks"

### 3. Chain Reaction Test
1. Create a line of 5 blocks in close proximity
2. Expand the middle block dramatically
3. **Expected Behavior:**
   - Immediate neighbors move with orange glow
   - Secondary neighbors may move with purple ripple effect
   - Cascading animation from center outward

### 4. Dynamic Zoom Test
1. Create a block with minimal content: "Small"
2. Edit and expand to very large content (copy-paste a paragraph)
3. **Expected Behavior:**
   - Block scales up significantly
   - Viewport automatically zooms out to accommodate
   - Notification: "Zoomed out to accommodate larger block"

## Advanced Test Scenarios

### Scenario A: Dense Layout Reorganization
```
Setup:
┌─────┐ ┌─────┐ ┌─────┐
│  1  │ │  2  │ │  3  │
└─────┘ └─────┘ └─────┘
┌─────┐ ┌─────┐ ┌─────┐
│  4  │ │  5  │ │  6  │
└─────┘ └─────┘ └─────┘

Action: Expand block 5 to 10x original size
Expected: All surrounding blocks (1,2,3,4,6) repositioned
```

### Scenario B: Performance Under Load
```
Setup: Create 20+ small blocks in close proximity
Action: Rapidly expand multiple blocks simultaneously
Expected: Smooth animations, no lag, efficient repositioning
```

### Scenario C: Image Integration Test
```
Setup: Block with image + text content
Action: Add substantial text content
Expected: Scaling accounts for image space, proper repositioning
```

## Visual Feedback Verification

### Animation Checklist
- [ ] Blue pulse during active scaling
- [ ] Orange glow for repositioned neighbors
- [ ] Purple ripple for chain reactions
- [ ] Smooth staggered movements
- [ ] Activity indicator in toolbar
- [ ] Proper notification messages

### Performance Metrics
- Scaling decision: < 5ms
- Animation smoothness: 60fps
- Memory usage: Stable during operations
- No visual artifacts or jumps

## Edge Cases to Test

### 1. Rapid Text Input
- Type very quickly in a block
- Verify debouncing works (500ms delay)
- No excessive calculations during typing

### 2. Maximum Size Constraints
- Try to create extremely large blocks
- Verify max dimensions are respected (450px width, 320px height)
- Blocks don't grow beyond viewport

### 3. Minimum Size Constraints  
- Delete most content from a large block
- Verify minimum dimensions maintained (140px width, 80px height)
- Content remains readable

### 4. Concurrent Operations
- Edit multiple blocks simultaneously
- Verify animations don't conflict
- Each block scales independently

### 5. Undo/Redo with Scaling
- Expand a block (triggers repositioning)
- Undo the change
- Verify blocks return to original positions

## Debugging Tools

### Enable Debug Mode
```javascript
// Run in browser console
localStorage.setItem('mindmap-debug-scaling', 'true');
// Reload page to see detailed console logs
```

### Console Commands
```javascript
// Check current scaling state
console.log('Repositioning blocks:', window.mindmapContext?.repositioningBlocks);

// Force trigger scaling test
window.mindmapContext?.handleDynamicScaling('block-id', {width: 400, height: 200}, {width: 200, height: 100});

// Monitor performance
console.time('scaling-operation');
// Perform scaling action
console.timeEnd('scaling-operation');
```

## Expected Results Summary

### ✅ Success Indicators
- Smooth, responsive block resizing
- Intelligent neighbor avoidance
- Appropriate zoom adjustments (>30% growth)
- Clear visual feedback throughout
- No performance degradation
- Intuitive user experience

### ❌ Failure Indicators  
- Jerky or abrupt movements
- Blocks overlapping after scaling
- Excessive zoom changes
- Missing visual feedback
- Performance lag or freezing
- Confusing user experience

## Troubleshooting Common Issues

### Issue: Blocks not repositioning
**Check:** Are blocks within influence radius (1.2x larger dimension)?
**Fix:** Move blocks closer before expanding

### Issue: No zoom adjustment
**Check:** Did block grow >30%? Is content larger than viewport?
**Fix:** Create larger content changes

### Issue: Performance problems
**Check:** How many blocks are in mindmap? (>50 may cause slowdown)
**Fix:** Enable performance mode or reduce block count

### Issue: Animations stuttering
**Check:** Browser hardware acceleration enabled?
**Fix:** Enable GPU acceleration in browser settings

## Test Completion Checklist

- [ ] Basic real-time scaling works
- [ ] Neighbor repositioning triggered appropriately  
- [ ] Chain reactions occur in dense layouts
- [ ] Dynamic zoom adjusts when needed
- [ ] All visual indicators appear correctly
- [ ] Performance remains smooth throughout
- [ ] Edge cases handled gracefully
- [ ] Debug tools provide useful information

## Next Steps

After completing these tests:
1. **Report Results**: Document any issues found
2. **Performance Tuning**: Adjust thresholds if needed  
3. **User Feedback**: Gather real-world usage patterns
4. **Feature Refinement**: Iterate based on testing results

The dynamic scaling system should feel invisible to users while providing intelligent layout management that enhances the mindmapping experience.