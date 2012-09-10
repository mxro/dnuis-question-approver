// <!-- one.upload https://u1.linnk.it/qc8sbw/usr/apps/textsync/docs/dnuis-question-approver-app-js-0.0.1 -->

(function($, AJ) {

	$.initQuestionApprover = function(params) {

		var elem = params.elem;
		var client = params.client;

		var questionsForReviewNode = client
				.reference("http://slicnet.com/questio/questio");
		var questionsForReviewSecret = "thd3pb41jrke83i";

		var sqdata = $.initStrategyQuestionData({
			client : client
		});

		var renderers = AJ.odb.rendering().createCompleteRendererRegistry(
				function(input) {
					return input;

				});
		// var converter = new Markdown.Converter();

		// renderers.addRenderer(AJ.odb.rendering().createMarkdownRenderer(
		// function(input) {
		// return converter.makeHtml(input);
		// }));
		// var renderers =

		// constants
		var aQuestionBag = client
				.reference("http://slicnet.com/mxrogm/mxrogm/apps/nodejump/docs/8/n/Types/Question_Bag");
		var aQuestionBagRepository = client
				.reference("http://slicnet.com/mxrogm/mxrogm/apps/nodejump/docs/8/n/Types/Question_Bag_Repository");

		var questionFormTemplate = client
				.reference("https://u1.linnk.it/qc8sbw/usr/apps/textsync/docs/approve-strategy-question-form-html-0.0.1");

		var qa = {};

		qa.selectedRepo = null;
		qa.selectedQuestionBag = null;

		qa.uploadQuestions = function(resolvedQuestionNodes) {
			client.seed({
				onSuccess : function(res) {

					var repo = res.root;

					client.append({
						node : aQuestionBagRepository,
						to : repo
					});

					var questions = client.append({
						node : "questions",
						to : repo,
						atAddress : "./questions"
					});

					client.append({
						node : aQuestionBag,
						to : questions
					});

					$('.pendingQuestions').append("<p>Uploading ...</p>");

					client.commit({
						onSuccess : function() {
							$('.pendingQuestions').append(
									"<p>All uploaded to: " + repo.url() + " "
											+ res.secret + "</p>");
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
			client
					.load({
						node : questionsForReviewNode,
						secret : questionsForReviewSecret,
						onSuccess : function(res) {

							client
									.select({
										from : res.loadedNode,
										onSuccess : function(sr) {

											var num = 1;
											$
													.each(
															sr.values,
															function(index,
																	value) {
																if (value.value) {

																	var split = value
																			.value()
																			.split(
																					"&");

																	if (split[0]
																			&& split[1]) {
																		var address = split[0];
																		var secret = split[1];

																		var newRow = $(
																				'.incomingQuestions',
																				elem)
																				.append(
																						"<tr><td>1</td><td class='approvalForm'></td>");

																		qa.priv
																				.appendQuestionForm(
																						$(
																								'.approvalForm',
																								newRow),
																						function(
																								questionForm) {

																							sqdata
																									.loadQuestion(
																											client
																													.reference(address),
																											secret,
																											function(
																													questionData) {
																													questionForm.loadQuestion(questionData);
																											});
																							

																						});

																	}
																}
															});

										}
									});

						}
					});
		};

		qa.priv.appendQuestionForm = function(toElem, onSuccess) {

			client.load({
				node : questionFormTemplate,
				onSuccess : function(res) {

					AJ.odb.rendering().render({
						node : res.loadedNode,
						registry : renderers,
						client : client,
						onSuccess : function(html) {
							var formElem = toElem.append("<div></div>");

							formElem.html( html);

							var questionForm = $.initStrategyQuestionForm({
								elem : $('.questionForm', formElem)
							});

							$('.approveButton', formElem).click(function(evt) {
								evt.preventDefault();
								formElem.remove();
							});

							$('.rejectButton', formElem).click(function(evt) {
								evt.preventDefault();
								formElem.remove();
							});

							onSuccess(questionForm);
						}
					});

					// var html = client.dereference({
					// ref : res.loadedNode
					// }).value();

				}
			});

		};

		// init ui
		(function() {
			qa.updateDestination();

			qa.priv.loadQuestions();

			elem.show()
		})();

		return {

		};
	};

})(jQuery, AJ);

// <!-- one.end -->
