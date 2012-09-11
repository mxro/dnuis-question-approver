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

		// constants
		var aQuestionBag = client
				.reference("http://slicnet.com/mxrogm/mxrogm/apps/nodejump/docs/8/n/Types/Question_Bag");
		var aQuestionBagRepository = client
				.reference("http://slicnet.com/mxrogm/mxrogm/apps/nodejump/docs/8/n/Types/Question_Bag_Repository");

		var questionFormTemplate = client
				.reference("https://u1.linnk.it/qc8sbw/usr/apps/textsync/docs/approve-strategy-question-form-html-0.0.1");

		var questionRepositorySecret = "qt2e21opqdljhxb";

		var qa = {};

		qa.selectedRepo = null;
		qa.selectedQuestionBag = null;

		qa.approvalFormTermplate = null;

		qa.createRepositoryAndBag = function(resolvedQuestionNodes) {
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

					client.commit({
						onSuccess : function() {
							$('.pendingQuestions').append(
									"<p>Repository created: " + repo.url()
											+ " " + res.secret + "</p>"
											+ "Question bag created: "
											+ questions.url());
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

			AJ.ui.showStatus("Loading submitted questions node.");
			client.load({
				node : questionsForReviewNode,
				secret : questionsForReviewSecret,
				onSuccess : function(res) {

					AJ.ui.showStatus("Downloading submitted children.");

					client.select({
						from : res.loadedNode,
						onSuccess : function(sr) {

							qa.priv.renderQuestions(0, 1, sr.values);

						}
					});

				}
			});
		};

		qa.priv.renderQuestions = function(idx, num, questions) {

			if (idx >= questions.length) {
				return;
			}

			var value = questions[idx];
			//var num = idx + 1;

			if (!value.value) {
				qa.priv.renderQuestions(idx + 1, num, questions);
				return;
			}

			var split = value.value().split("&");

			AJ.ui.showProgressBar();
			if (split[0] && split[1]) {
				var address = split[0];
				var secret = split[1];

				var newRow = $("<tr class='hide'><td>" + num
						+ "</td><td class='approvalForm'></td></tr>");

				//num = num + 1;

				$('.incomingQuestions', elem).append(newRow);

				AJ.ui.showStatus("Rendering question from for: " + address);

				qa.priv
						.appendQuestionForm(
								$('.approvalForm', newRow),
								newRow,
								address,
								secret,
								function(questionForm) {

									AJ.ui
											.showStatus("Loading question data for: "
													+ address);
									sqdata
											.loadQuestion(
													client.reference(address),
													secret,
													function(questionData) {
														AJ.ui
																.showStatus("Question loaded successfully: "
																		+ address);
														questionForm
																.loadQuestion(questionData);

														newRow.show();
														AJ.ui.hideProgressBar();
														AJ.ui
																.showStatus("Question completely rendered: "
																		+ address);
														qa.priv
																.renderQuestions(
																		idx + 1,
																		num + 1,
																		questions);
													});

								});

			}

		}

		qa.priv.getApprovalFormTemplate = function(onSuccess) {
			if (qa.approvalFormTermplate) {
				onSuccess(qa.approvalFormTermplate);
				return;
			}

			client.load({
				node : questionFormTemplate,
				onSuccess : function(res) {

					AJ.odb.rendering().render({
						node : res.loadedNode,
						registry : renderers,
						client : client,
						onSuccess : function(html) {
							qa.approvalFormTermplate = html;
							onSuccess(html);
						}
					});

				}
			});

		};

		qa.priv.appendQuestionForm = function(toElem, row, address, secret,
				onSuccess) {

			if (!address) {
				throw "Address must be defined";
			}

			if (!secret) {
				throw "Secret must be defined";
			}

			qa.priv
					.getApprovalFormTemplate(function(html) {
						var formElem = $("<div></div>");
						toElem.append(formElem);

						formElem.html(html);

						var questionForm = $.initStrategyQuestionForm({
							elem : $('.questionForm', formElem)
						});

						$('.approveButton', formElem)
								.click(
										function(evt) {
											evt.preventDefault();
											qa.priv
													.approveQuestion(
															client
																	.reference(address),
															questionForm,
															secret,
															function() {
																row
																		.html("<div style='margin-left: 35px;'><i class='icon-ok'></i> Question Approved!</div>");
																row.show();
															});
											row.hide();
										});

						$('.rejectButton', formElem).click(
								function(evt) {
									evt.preventDefault();
									qa.priv.rejectQuestion(client
											.reference(address), secret);
									row.remove();
								});

						onSuccess(questionForm);
					});

		};

		qa.priv.removeQuestionFromQueue = function(questionNode, secret) {
			client.select({
				from : questionsForReviewNode,
				onSuccess : function(sr) {
					$.each(sr.values, function(index, node) {
						if (node.value
								&& typeof node.value === 'function'
								&& node.value() === questionNode.url() + "&"
										+ secret) {

							client.remove({
								node : node,
								from : questionsForReviewNode
							});

							client.commit({
								onSuccess : function() {

								}
							});
						}
					});
				}

			});
		}

		qa.priv.approveQuestion = function(questionNode, questionForm, secret,
				onSuccess) {
			qa.updateDestination();

			if (!qa.selectedQuestionBag) {
				throw "Cannot approve questions if no question bag is selected.";
			}

			if (!questionNode) {
				throw "Question node must be defined!";
			}

			client.load({
				node : client.reference(qa.selectedQuestionBag),
				secret : questionRepositorySecret,
				onSuccess : function(res) {

					if (!res.loadedNode) {
						throw "Loaded node not defined.";
					}

					client.appendSafe({
						node : questionNode,
						to : res.loadedNode,
						onSuccess : function(res) {

							sqdata.updateQuestion(questionNode, secret,
									questionForm.getData(), function() {
										qa.priv.removeQuestionFromQueue(
												questionNode, secret);

										onSuccess();
									});

						}
					});

					client.commit({
						onSuccess : function() {

						}
					});
				},
				onFailure : function(ex) {
					AJ.ui.notify("Unexpected exception while loading node: "
							+ ex, "alert-error");
				}
			});

		};

		qa.priv.rejectQuestion = function(node, secret) {
			qa.priv.removeQuestionFromQueue(node, secret);
		};

		// init ui
		(function() {
			qa.updateDestination();

			qa.priv.loadQuestions();

			elem.show()
		})();

		return {
			createRepositoryAndBag : qa.createRepositoryAndBag
		};
	};

})(jQuery, AJ);

// <!-- one.end -->
