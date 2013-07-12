define(['cascade'], function(Cascade) {
	window.cascade = Cascade.build();

	cascade.add('test-first', function(defer, common) {
		console.log('test-first')

		// set a value on common
		common.message = '"message set on the common object passed as second arg to all tasks"'

		setTimeout(function() { defer.resolve('alsdjlaks'); }, 3000);
	});

	cascade.add('test-second', function(defer, common) {
		console.log('test-second, message on common: ' + common.message);
		setTimeout(function() { defer.resolve() }, 600);
	});

	cascade.add('test-third', function(defer, common) {
		defer.resolve();
	});

	cascade.add('test-fourth', function(defer, common) {

		setTimeout(function() {
			defer.resolve();
		}, 900);
	});



	// ANoNYMOUS TASK
	cascade.add(function(promise, common) {

		console.log('running annonymous task');

		setTimeout(function() {
			promise.resolve();

			console.log('annonymous task finished');
		}, 3000);
	});



	cascade.on('sequence-start', function() {
		console.log('sequence started event at ' + new Date().getTime() / 1000);
	});

	cascade.on('start', function(taskname) {
		console.log('start event:' + taskname + ' ' + new Date().getTime() / 1000);
	});

	cascade.on('complete', function(taskname) {
		console.log('complete event:' + taskname + ' ' + new Date().getTime() / 1000);
	});

	cascade.on('complete:test-second', function() {
		console.log('complete:test-second event')
	});




	cascade.on('start:test-third', function() {
		console.log('start:test-third event');
	})

	cascade.on('sequence-complete', function() {
		console.log('sequence finished event at ' + new Date().getTime() / 1000);
	});

	window.aaa = cascade.run();
});