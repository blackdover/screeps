var roleBuilder = {

    run: function (creep) {
        // 如果能量为0，进入收集能量状态
        if (creep.store[RESOURCE_ENERGY] == 0 && creep.memory.state !== 'collecting') {
            creep.memory.state = 'collecting';
            creep.say('🔄 收集');
        }

        // 如果能量满了，进入建造或修理状态
        if (creep.store.getFreeCapacity() == 0) {
            if (creep.memory.state !== 'building') {
                creep.memory.state = 'building';
                creep.say('🚧 建造');
            }
        }

        // 根据状态执行不同任务
        switch (creep.memory.state) {
            case 'collecting':
                this.collectEnergy(creep);
                break;
            case 'building':
                this.buildLogic(creep);
                break;
            case 'requiring':
                this.repairLogic(creep);
                break;
            default:
                creep.say('💤 等待');
                break;
        }
    },

    collectEnergy: function (creep) {
        // 优先捡取地面上的能量
        let droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: (resource) => resource.resourceType == RESOURCE_ENERGY && resource.amount > 0
        });

        if (droppedEnergy.length > 0) {
            // 找到最近的能量，并捡起
            let target = droppedEnergy.sort((a, b) => {
                return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
            })[0];

            if (creep.pos.isNearTo(target)) {
                creep.pickup(target);
            } else {
                creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
            return; // 捡起能量后退出，不再收集其他能量
        }

        // 其次查找storage中的能量
        let storages = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] > 0
        });

        if (storages.length > 0) {
            // 提取storage中的能量
            let target = storages.sort((a, b) => {
                return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
            })[0];

            if (creep.pos.isNearTo(target)) {
                creep.withdraw(target, RESOURCE_ENERGY);
            } else {
                creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
            return; // 从storage中提取能量后退出，不再查找container
        }

        // 最后查找容器中的能量
        let energySources = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
        });

        if (energySources.length > 0) {
            // 采集容器中的能量
            let target = energySources.sort((a, b) => {
                return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
            })[0];

            if (creep.pos.isNearTo(target)) {
                creep.withdraw(target, RESOURCE_ENERGY);
            } else {
                creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        } else {
            // 寻找资源点，排除指定ID的资源点
            var sources = creep.room.find(FIND_SOURCES, {
                filter: (source) => source.id != '5bbcafdc9099fc012e63b4c5'
            });
            if (sources.length > 0) {
                var closestSource = creep.pos.findClosestByPath(sources);
                if (creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestSource, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            } else {
                creep.say('No Energy');
            }
        }
    },


    buildLogic: function (creep) {
        // 查找所有建造任务
        let sites = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (sites.length == 0) {
            // 如果没有建造任务，切换到维修状态
            this.repairLogic(creep);
            return;
        }

        // 给不同建筑类型设定优先级
        const buildPriorityMap = {
            [STRUCTURE_SPAWN]: 1,
            [STRUCTURE_EXTENSION]: 2,
            [STRUCTURE_CONTAINER]: 3,
            [STRUCTURE_TOWER]: 4,
            [STRUCTURE_RAMPART]: 5,
            [STRUCTURE_WALL]: 6
        };

        // 按照优先级排序建筑
        sites = sites.sort((a, b) => {
            // 先比较建筑类型优先级，如果相同，再按距离排序
            let priorityA = buildPriorityMap[a.structureType] || 100;
            let priorityB = buildPriorityMap[b.structureType] || 100;

            if (priorityA === priorityB) {
                return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
            }

            return priorityA - priorityB;
        });

        // 选择排序后的第一个建筑进行建造
        let targetSite = sites[0];

        if (creep.build(targetSite) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targetSite, { visualizePathStyle: { stroke: '#ffffff' } });
        }
        // 不需要切换到 'requiring'，只需保持在建造状态，直到有需要维修的建筑
    },

    repairLogic: function (creep) {
        // 查找所有需要维修的建筑
        let structuresToRepair = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });

        if (structuresToRepair.length == 0) {
            creep.memory.state = 'collecting'; // 如果没有需要修理的物品，回收能量
            return;
        }

        // 给不同建筑类型设定优先级
        const repairPriorityMap = {
            [STRUCTURE_CONTAINER]: 1,
            // [STRUCTURE_SPAWN]: 2,
            // [STRUCTURE_EXTENSION]: 2,
            [STRUCTURE_RAMPART]: 3,
            // [STRUCTURE_TOWER]: 4,
            [STRUCTURE_ROAD]: 5,
            [STRUCTURE_WALL]: 6,
        };

        // 按照优先级和损坏程度进行排序
        structuresToRepair = structuresToRepair.sort((a, b) => {
            // 先比较优先级，再比较损坏比例
            let priorityA = repairPriorityMap[a.structureType] || 100;
            let priorityB = repairPriorityMap[b.structureType] || 100;

            // 优先级较高的先修复，优先级相同的按损坏比例排序
            if (priorityA === priorityB) {
                return (a.hits / a.hitsMax) - (b.hits / b.hitsMax); // 损坏比例
            }
            return priorityA - priorityB; // 优先级排序
        });

        // 选择排序后的第一个结构进行修复
        let target = structuresToRepair[0];

        if (creep.repair(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
    },

};

module.exports = roleBuilder;
