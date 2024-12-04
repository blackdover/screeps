var roleCarrier = {

    /** 
     * 运行carrier角色的逻辑
     * @param {Creep} creep 
     */
    run: function (creep) {
        // 初始化state
        if (!creep.memory.state) {
            creep.memory.state = 'harvesting';
        }

        // 检查spawn和extension的剩余容量
        var spawnsAndExtensions = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => 
                (structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION) &&
                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });

        // 检查storage的剩余容量
        var storage = creep.room.storage;

        if (creep.memory.state == 'harvesting') {
            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                // 查找container中包含能量的结构
                var containers = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0
                });

                if (containers.length > 0) {
                    let target = containers.sort((a, b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b))[0];
                    if (creep.pos.isNearTo(target)) {
                        creep.withdraw(target, RESOURCE_ENERGY);
                    } else {
                        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                } else if (spawnsAndExtensions.length > 0 || (storage && storage.store[RESOURCE_ENERGY] > 0)) {
                    if (storage && storage.store[RESOURCE_ENERGY] > 0) {
                        if (creep.pos.isNearTo(storage)) {
                            creep.withdraw(storage, RESOURCE_ENERGY);
                        } else {
                            creep.moveTo(storage, { visualizePathStyle: { stroke: '#00ffff' } });
                        }
                    }
                }
                // 如果成功获取能量，切换到delivering
                if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                    creep.memory.state = 'delivering';
                }
            } else {
                // 背包满了，切换到delivering
                creep.memory.state = 'delivering';
            }
        } else if (creep.memory.state == 'delivering') {
            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                if (spawnsAndExtensions.length > 0) {
                    let target = spawnsAndExtensions.sort((a, b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b))[0];
                    if (creep.pos.isNearTo(target)) {
                        creep.transfer(target, RESOURCE_ENERGY);
                    } else {
                        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                    }
                } else if (storage && storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    if (creep.pos.isNearTo(storage)) {
                        creep.transfer(storage, RESOURCE_ENERGY);
                    } else {
                        creep.moveTo(storage, { visualizePathStyle: { stroke: '#00ff00' } });
                    }
                } else {
                    // 没有地方transfer，切换到harvesting
                    creep.memory.state = 'harvesting';
                }
            } else {
                // 背包空了，切换到harvesting
                creep.memory.state = 'harvesting';
            }
        }
    }
};

module.exports = roleCarrier;