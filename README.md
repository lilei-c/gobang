# gobang

五子棋

<https://notsofunnyha.github.io/gobang/dist/index.html>

### 性能优化总结

- 避免字符串拼接
- 必要时, 尝试用数组 (类型化数组?) 代替 Object/Map
- 深度搜索时, 在同一棋盘实例上下棋再回滚更优, 不要生成终端节点实列
- 不必全局遍历, 优先选择`可能`的位置, 也有利于充分利用 alphabeta 剪枝

### 必要时, 尝试用数组 (类型化数组?) 代替 Object/Map

```
如果单纯 for 循环去读取同一个属性值, 底层会自动优化,
尝试一个多层的 Object/Map 每次取不同的属性值, 性能会直线下降
```

### todo

- 优化 minimax 性能
