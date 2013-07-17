define(['jquery','cascade'], function($, Cascade) {

	// initial
	// this task does not call next, but returns a promise
	function initial(next, common) {
		var defer = $.Deferred();

		console.log('initial', Date())

		setTimeout(defer.resolve, 5000);

		return defer;
	}

	// first task
	function first(next, common) {
		console.log('running firest', Date())
		common.firstres = 'bananas';
		setTimeout(next, 2333);
	}

	// second task 
	function second(next, common) {
		console.log('running second', Date())
		setTimeout(next, 2000);
	}

	window.cascade = Cascade.build();

	// add the tasks to be run.
	cascade.add(initial);
	cascade.add(first);
	cascade.add(second);


	cascade.run().then(function() {
		console.log('cascade finished', Date())
	})
});