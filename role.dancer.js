var roleDancer = {
    /** @param {Creep} creep **/
    run: function(creep) {
        var targetRoomName = 'E43N39'; // 目标房间名称
        var targetPos = new RoomPosition(30, 22, targetRoomName); // 目标位置

        if (creep.room.name !== targetRoomName || !creep.pos.isEqualTo(targetPos)) {
            // 如果不在目标房间，或者当前位置不是目标位置
            creep.moveTo(targetPos, { visualizePathStyle: { stroke: '#ffaa00' } }); // 移动到目标房间的目标位置
        } else {
            // 已经到达目标位置
            if (!creep.memory.hasSaidHello) {
                creep.say('让我们一起摇摆'); // 如果还没有说过“你好”，则说“你好”
                // creep.memory.hasSaidHello = true; // 标记已说过“你好”
            }
            // 开始跳舞
            var randomDirection = Math.floor(Math.random() * 8); // 生成一个0到7之间的随机数，代表八个方向
            creep.move(randomDirection); // 移动到随机方向
        }
    }
};
//Game.spawns['Spawn1'].spawnCreep([MOVE], 'dancer2', { memory: { role: 'dancer' } });
module.exports = roleDancer;