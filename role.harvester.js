var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // 指定资源点 ID
        var sourceId = '5bbcafdc9099fc012e63b4c5';
        var source = Game.getObjectById(sourceId); // 指定的资源点

        // 检查资源点是否存在且有能量
        if (source && source.energy > 0) {
            // 如果采集者有空余容量，进行采集
            // if (creep.store.getFreeCapacity() > 0) {
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            // } 
            // else {
            //     // 如果采集者没有空余容量，传输能量到最近的 Container
            //     var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            //         filter: (s) => s.structureType == STRUCTURE_CONTAINER
            //     });
            //     if (container) {
            //         if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            //             creep.moveTo(container, { visualizePathStyle: { stroke: '#ffffff' } });
            //         }
            //     } else {
            //         // 没有Container，呆在原地
            //     }
            // }
        } 
        // else {
        //     // 资源点被采光，记录在记忆中，呆在原地
        //     if (!creep.memory.sourceEmpty) {
        //         creep.memory.sourceEmpty = true;
        //     }
        //     // 呆在原地
        //     creep.say('Idle');
        // }
    }
};

module.exports = roleHarvester;