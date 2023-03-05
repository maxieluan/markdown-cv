## Tricky problem
optimization --> minimizer --> TerserPlugin --> terserOptions --> output --> ascii_only --> true
出于某种奇怪的原因，此选项设置为false或使用默认值时，会导致编译成的文件中出现乱码，设置为true后，编译出的文件中就没有乱码了。