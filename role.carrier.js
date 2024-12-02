var roleCarrier = {

    /** 
     * 运行carrier角色的逻辑
     * @param {Creep} creep 
     */
    run: function (creep) {
        // 如果有空间收集能量
        if(creep.store.getFreeCapacity() > 0) {
            // 优先收集地面上的能量
            var droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: (resource) => resource.resourceType == RESOURCE_ENERGY && resource.amount > 0
            });

            if (droppedEnergy.length > 0) {
                // 找到最近的能量并捡起
                let target = droppedEnergy.sort((a, b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b))[0];
                
                if(creep.pos.isNearTo(target)) {
                    creep.pickup(target);
                } else {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
                return; // 捡起能量后退出
            }

            // 如果没有能量在地面上，收集矿源中的能量
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            // 如果背包满了，开始运输能量
            
            // 首先，尝试将能量传输到spawn或extension
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });

            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else {
                // 如果没有可用的spawn或extension，尝试将能量传输到container
                var containers = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => structure.structureType == STRUCTURE_CONTAINER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                });

                if(containers.length > 0) {
                    if(creep.transfer(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(containers[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
        }
    }
};

module.exports = roleCarrier;
