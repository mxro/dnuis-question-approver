// <!-- one.upload https://u1.linnk.it/qc8sbw/usr/apps/textsync/docs/dnuis-question-approver-app-js-0.0.1 -->

(function($, AJ) {

		$.initQuestionApprover = function(params) {

			var elem = params.elem;
			var client = params.client;
			
			var questionsForReviewNode = client.reference("http://slicnet.com/questio/questio");
			var questionsForReviewSecret = "thd3pb41jrke83i";
			
			
			
			// constants
			var aQuestionBag = client.reference("http://slicnet.com/mxrogm/mxrogm/apps/nodejump/docs/8/n/Types/Question_Bag");
			var aQuestionBagRepository = client.reference("http://slicnet.com/mxrogm/mxrogm/apps/nodejump/docs/8/n/Types/Question_Bag_Repository");
			
			var qa = {};
			
			qa.selectedRepo = null;
			qa.selectedQuestionBag = null;
			
			
			
			qa.uploadQuestions = function(resolvedQuestionNodes) {
				client.seed({
					onSuccess: function(res) {
						
						var repo = res.root;
						
						client.append({
							node: aQuestionBagRepository,
							to: repo
						});
						
						var questions = client.append({
							node: "questions",
							to: repo,
							atAddress: "./questions"
						});
						
						client.append({
							node: aQuestionBag,
							to: questions
						});
						
						$.each(resolvedQuestionNodes, function(index, value) {
							if (value.value) {
								$('.pendingQuestions').append("<p>"+value.value()+"</p>");
								
								var split=value.value().split("&");
								$('.pendingQuestions').append("<p>Only Url: "+split[0]+"</p>");
								
								if (split[0]) {
									client.append({
										node: client.reference(split[0]),
										to: questions
									});
								}
							}
						});
						
						$('.pendingQuestions').append("<p>Uploading ...</p>");
						
						client.commit({
							onSuccess: function() {
								$('.pendingQuestions').append("<p>All uploaded to: "+repo.url()+" "+res.secret+"</p>");
							}
							
						});
						
					}
				});
				
				
			};
			
			qa.updateDestination = function() {
				var repo = $('.repositorySelect', elem).val();
				qa.selectedRepo = repo;
				
				$('.destRepoLabel', elem).attr('href', repo);
				$('.destRepoLabel', elem).html(repo);
				
				var qbag = $('.questionBagSelect', elem).val();
				qa.selectedQuestionBag = qbag;
				$('.questionBagLabel').attr('href', qbag);
				$('.questionBagLabel').html(qbag);
			};
			
			qa.priv = {};
			
			qa.priv.loadQuestions = function() {
				client.load({
					node: questionsForReviewNode,
					secret: questionsForReviewSecret,
					onSuccess: function(res) {
						
						client.select({
							from: res.loadedNode,
							onSuccess: function(sr) {
								
								uploadQuestions(sr);
								
							}
						});
						
					}
				});
			};
			
			// init ui
			(function() {
				qa.updateDestination();
				
				
				elem.show()
			}) ();
			
			return {

			};
		};

	})(jQuery, AJ);

// <!-- one.end -->
