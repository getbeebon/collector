const kue = require('kue');
const console = require('tracer').colorConsole();

const publisher = (config, conn) => {
    let queue = null;
    let jobs = {};

    let start = () => {
        queue = kue.createQueue();
        startPublisher();
    }

    let setStatus = (data, status) => {
        if (!data) {
            return 
        }
        
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

    let startPublisher = () => {
        queue.on('job complete', function (id, type) {
            console.log('job complete id', id, 'type', type);
            setStatus(jobs[id], 'task complete');
            delete jobs[id]
        });
    }

    let publish = (task, data, id) => {
        let jobData = { id,
            key: task.replace(config.kue.prefix, '')
        };
        
        let job = queue.create(task, data).save(function (err) {
            if (err) {
                console.log('err', err);
                setStatus(jobData, 'task error');
            } else {
                jobs[job.id] = jobData;
            }
        });
    }

    start();

    return { publish }
};

module.exports = publisher;