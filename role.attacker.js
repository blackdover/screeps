var roleAttacker = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // 如果 Creep 没有能量，从 Extension 提取能量
        if (creep.store[RESOURCE_ENERGY] === 0) {
            var extension = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_EXTENSION &&
                                       structure.store[RESOURCE_ENERGY] > 0
            });
            if (extension) {
                if (creep.withdraw(extension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(extension, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }
        } 
        // 如果 Creep 已经攻击过，则进入“转圈”状态，不再主动攻击
        else if (creep.memory.state === 'attacked') {
            // 在敌方区域内转圈
            var randomDirection = Math.floor(Math.random() * 8);  // 随机方向（8个方向）
            creep.move(randomDirection);
        }
        else {
            // 查找敌方 Creep
            var hostileCreep = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (hostileCreep) {
                if (creep.attack(hostileCreep) == OK) {
                    creep.memory.state = 'attacked'; // 标记为已经攻击过
                } else {
                    creep.moveTo(hostileCreep, { visualizePathStyle: { stroke: '#ff0000' } });
                }
            } 
            // 查找敌方建筑
            else {
                var hostileStructure = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
                if (hostileStructure) {
                    if (creep.attack(hostileStructure) == OK) {
                        creep.memory.state = 'attacked'; // 标记为已经攻击过
                    } else {
                        creep.moveTo(hostileStructure, { visualizePathStyle: { stroke: '#ff0000' } });
                    }
                }
            }
        }
    }
};

module.exports = roleAttacker;
