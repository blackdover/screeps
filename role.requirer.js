var roleRequirer = {

    run: function(creep) {
        // 初始化状态
        if (!creep.memory.state) {
            creep.memory.state = 'collecting';
        }

        // 检查当前能量状态并切换状态
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.state = 'collecting';
        } else if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.state = 'transferring';
        }

        if (creep.memory.state == 'collecting') {
            // 收集能量
            var storages = creep.room.find(FIND_STRUCTURES, {
                filter: (struct) => struct.structureType == STRUCTURE_STORAGE && struct.store[RESOURCE_ENERGY] > 0
            });

            if (storages.length > 0) {
                var target = storages.sort((a, b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b))[0];
                if (creep.pos.isNearTo(target)) {
                    creep.withdraw(target, RESOURCE_ENERGY);
                } else {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
                return;
            }

            // 如果storage没有能量，再从container取能量
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (struct) => struct.structureType == STRUCTURE_CONTAINER && struct.store[RESOURCE_ENERGY] > 0
            });

            if (containers.length > 0) {
                var target = containers.sort((a, b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b))[0];
                if (creep.pos.isNearTo(target)) {
                    creep.withdraw(target, RESOURCE_ENERGY);
                } else {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
                return;
            }

            // 如果container没有能量，再从spawn取能量
            var spawns = creep.room.find(FIND_STRUCTURES, {
                filter: (struct) => struct.structureType == STRUCTURE_SPAWN && struct.store[RESOURCE_ENERGY] > 0
            });

            if (spawns.length > 0) {
                var target = spawns.sort((a, b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b))[0];
                if (creep.pos.isNearTo(target)) {
                    creep.withdraw(target, RESOURCE_ENERGY);
                } else {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
                return;
            }
        } else if (creep.memory.state == 'transferring') {
            // 如果能量为空，切换到收集状态
            if (creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.state = 'collecting';
                return;
            }

            // 维修container
            var containersToRepair = creep.room.find(FIND_STRUCTURES, {
                filter: (struct) => struct.structureType == STRUCTURE_CONTAINER && struct.hits < (struct.hitsMax * 0.9)
            });

            if (containersToRepair.length > 0) {
                var target = containersToRepair.sort((a, b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b))[0];
                if (creep.pos.isNearTo(target)) {
                    creep.repair(target);
                } else {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' } });
                }
                return;
            }

            // 转移能量到塔
            var tower = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_TOWER) && 
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            if (tower.length > 0) {
                if (creep.transfer(tower[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(tower[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        }
    }
};

module.exports = roleRequirer;
