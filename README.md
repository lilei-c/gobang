# 五子棋人机对战

试玩

<https://notsofunnyha.github.io/gobang/dist/index.html>

## 启发式搜索的效率

- 单纯增加 AB 剪枝 (随机搜索子节点), 已经可以节省几倍算力, 但对指数增长来说`几倍`比较乏力
- 如果从最优节点开始搜索, 可以将搜索节点数从 N 降低到 根号 N
- 实际上, 不可能评估出最优节点, 如果能那就不用深度搜索了:)
- 即使只是大致的评估, 也能`极大`提高剪枝效率
- 好的开局和评估函数比搜索深度更重要, 单纯增加启发式搜索棋力不一定提高

以下验证数据, 并不精确, 但能看到实际评估节点已达到 根号 N 的数量级, 效果明显

#### 随机排序

| 搜索深度 | 候选棋子数 | 全部节点 | 评估节点 | 直接剪掉节点 | 实际剪掉节点 |
| -------- | ---------- | -------- | -------- | ------------ | ------------ |
| 4        | 15         | 50625    | 8365     | 824          | 42260        |
| 4        | 20         | 160000   | 31485    | 2535         | 128515       |

#### 按价值排序

| 搜索深度 | 候选棋子数 | 全部节点 | 评估节点 | 直接剪掉节点 | 实际剪掉节点 |
| -------- | ---------- | -------- | -------- | ------------ | ------------ |
| 4        | 15         | 50625    | 813      | 127          | 49812        |
| 4        | 20         | 160000   | 760      | 551          | 159240       |

## 性能优化

- `js 基础`
- 避免字符串拼接
- 必要时, 尝试用数组/类型化数组 代替 Object/Map
- 数组的 unshift 比 push 慢约 7 倍
- for 快于 forEach, for of
- for 快于 while
- `算法相关`
- 深度搜索时, 在同一棋盘实例上下棋再回滚更优, 不要生成终端节点实列
- 不必全局遍历, 优先选择`可能`的位置, 也有利于充分利用 alphabeta 剪枝

## 测试性能的误区

```
为了测试可能会这样写
for(var i=0;i<10000;i++){ ... }

这里可能存在问题, 例如 hashmap 取值

单纯 for 循环去读取同一个属性值, 会有缓存或者自动优化,
尝试一个多层的 Object/Map 每次取不同的属性值, 性能会直线下降
```
