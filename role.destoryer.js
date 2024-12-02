var roleDestroyer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // 找到目标墙（或其他可以拆除的结构）
        var wall = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_WALL
        });

        if(wall) {
            // 尝试摧毁墙壁（使用 dismantle 来摧毁墙壁而不是 attack）
            if(creep.dismantle(wall) == ERR_NOT_IN_RANGE) {
                creep.moveTo(wall);  // 如果墙不在拆除范围内，移动到墙的位置
            }
        }
    }
};

module.exports = roleDestroyer;
