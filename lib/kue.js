var kue = require('kue');
var console = require('tracer').colorConsole();

var publisher = function (config, conn) {
    var queue = null;
    var jobs = {};
    var start = function () {
        queue = kue.createQueue();
        startPublisher();
    };

    function setStatus(data, status) {
        if (data) {
            conn.query("UPDATE  ?? SET `status` = ? where `id` = ? ;",
                [data.key, status, data.id],
                function (err) {
                    if (err) {
                        console.log('err', err)
                    } else {
                        console.log('status change')
                    }
                });
        }
    }

    function startPublisher() {
        queue.on('job complete', function (id, type) {
            console.log('job complete id', id, 'type', type);
            setStatus(jobs[id], 'task complete');
            delete jobs[id]
        });
    }


    function publish(task, data, id) {
        var jobData = {
            id: id,
            key: task.replace(config.kue.prefix, '')
        };
        var job = queue.create(task, data).save(function (err) {
            if (err) {
                console.log('err', err);
                setStatus(jobData, 'task error');
            } else {
                jobs[job.id] = jobData;
            }
        });
    }

    start();

    return {
        publish: publish
    }
};

module.exports = publisher;