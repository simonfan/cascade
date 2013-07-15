define(['cascade'], function(Cascade) {


	// first task
	function first(next, common) {
		console.log('running firest')
		common.firstres = 'bananas';
		setTimeout(next, 2333);
	}

	// second task 
	function second(next, common) {
		console.log('running second')
		setTimeout(next, 2000);
	}

	window.cascade = Cascade.build();

	cascade.add(first);
	cascade.add(second);


	cascade.run().then(function() {
		console.log('cascade finished')
	})
});