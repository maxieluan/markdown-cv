## Tricky problem
optimization --> minimizer --> TerserPlugin --> terserOptions --> output --> ascii_only --> true
出于某种奇怪的原因，此选项设置为false或使用默认值时，会导致编译成的文件中出现乱码，设置为true后，编译出的文件中就没有乱码了。

## 未来可能要做的事情
- [ ] 很明显我render ast的方法非常愚蠢，要用递归来做
- [ ] skill的高亮我没做好，我用rect的方法画方块，然后用手动调整位置到文字后面。然后等我都写完了以后才发现有`hightlight`这个api
- [ ] 代码的结构非常混乱
- [ ] 我想增加table的支持，这要在完成递归之后做

