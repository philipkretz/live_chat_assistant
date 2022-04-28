class PkLiveChatBot {
    constructor(params) {
        this.questions = typeof params.questions !== "undefined" ? params.questions : [];
        this.currentQuestion = typeof params.currentQuestion !== "undefined" ? params.currentQuestion : 'init';
        this.liveChatLayer = typeof params.liveChatLayer !== "undefined" ? params.liveChatLayer : '#livechat-assistant';
        this.master = typeof params.master !== "undefined" ? params.master : 'Philip';
        this.formMessageField = typeof params.formMessageField !== "undefined" ? params.formMessageField : "[name='form-message']";
    }

    getQuestion() {
        return this.questions[this.currentQuestion];
    }

    estimateAction(intent) {
        if (typeof this.questions[intent] !== 'undefined') {
            this.currentQuestion = intent;
            return;
        }

        intent = intent.toLowerCase().trim();
        let estimatedQuestion = null;
        let estimationScore = 0;
        let highestEstimationScore = 0;
        for (const qIndex in this.questions) {
            const question = this.questions[qIndex];
            highestEstimationScore = estimationScore;
            estimationScore = 0;
            question.keywords.forEach(function (keyword) {
                if (intent.indexOf(keyword.toLowerCase()) !== -1) {
                    estimationScore++;

                    if (estimationScore >= highestEstimationScore) {
                        estimatedQuestion = qIndex;
                    }
                }
            });
        }

        if (estimatedQuestion !== null) {
            this.currentQuestion = estimatedQuestion;
            return;
        }

        // crawl page links
        let foundPageLink = false;
        ['a', 'button'].forEach(function(tag) {
            document.querySelectorAll(tag).forEach(function(el) {  // bug in jquery?
                const href = typeof el.href !== "undefined" ? el.href : '';
                const title = typeof el.title !== "undefined" ? el.title : '';
                const ariaLabel = typeof el.ariaLabel !== "undefined" ? el.ariaLabel : '';
                const text = el.firstChild !== null && typeof el.firstChild.textContent !== "undefined" ? el.firstChild.textContent : '';
                
                if (((ariaLabel+'').length > 2 && (ariaLabel+'').toLowerCase().trim().indexOf(intent) !== -1) 
                    || ((title+'').length > 2 && (title+'').toLowerCase().trim().indexOf(intent) !== -1)
                    || ((text+'').length > 2 && (text+'').toLowerCase().trim().indexOf(intent) !== -1) 
                    || ((href+'').length > 2 && (href+'').toLowerCase().trim().indexOf(intent) !== -1)) {
                    el.click();
                    foundPageLink = true;
                    return false;
                }
            });
        });

        jQuery(liveChatButton).fadeIn("slow", function() {
            jQuery(this).removeClass('hidden');
        });
        jQuery(liveChatLayer).fadeOut("slow", function() {
            jQuery(this).addClass('hidden');
        });

        if (foundPageLink) {
            this.currentQuestion = "init";
        } else {
            this.currentQuestion = "fail";
            jQuery(this.formMessageField).html("Hi " + this.master + ",\n\n" + intent);
            jQuery('html, body').animate({
                scrollTop: jQuery(pkLiveChatBot.formMessageField).offset().top
            }, 2000);
        }
    }

    render() {
        jQuery(this.liveChatLayer).html('<p>' + this.getQuestion()['html'] + '</p>');
        jQuery(this.liveChatLayer).find('button').each(function() {
            let intent = $(this).data('intent');
            let question = pkLiveChatBot.getQuestion();
            let intentContent = question.intents[intent];

            if (typeof intentContent === 'function') {
                $(this).on('click', intentContent);
            } else {
                $(this).on('click', function() {
                    let intent = $(this).data('intent');
                    let question = pkLiveChatBot.getQuestion();
                    let intentContent = question.intents[intent];
                    pkLiveChatBot.estimateAction(intentContent);
                    pkLiveChatBot.render();
                });
            }
        });
    }
}

let master = 'Philip';
let formMessageField = "[name='form-message']";
let liveChatButton = "#livechat-button";
let liveChatLayer = "#livechat-assistant";
let avatar = "images/robot.png";
let avatarTitle = "robo assistant";

let params = {
    questions: {
        'init': {
          'html': `<div class="inline-block"><img src="` + avatar + `" title="` + avatarTitle + `" class="robo-icon align-bottom"></img></div>
                <div class="inline-block ml-25">Welcome to this page. I am ` + master + `\'s assistant. Can I help you?</div>
                <div class="inline-block ml-25">
                    <button type="button" class="btn btn-light ml-25" data-intent="next">Yes</button>
                    <button type="button" class="btn btn-light" data-intent="close">No</button>
                </div>`,
          'intents': {
            'next': 'phonecall',
            'close': function() {
                jQuery(liveChatButton).fadeIn("slow", function() {
                    jQuery(this).removeClass('hidden');
                });
                jQuery(liveChatLayer).fadeOut("slow", function() {
                    jQuery(this).addClass('hidden');
                });
            }
          },
          'keywords': [
              'start',
              'init',
              'back'
          ]  
        },
        'fail': {
          'html': `<div class="inline-block"><img src="` + avatar + `" title="` + avatarTitle + `" class="robo-icon align-bottom"></img></div>
                <div class="inline-block ml-25">Excuse me, but I don't quite understand you. Can I help you with something else?</div>
                <div class="inline-block ml-25">
                    <button type="button" class="btn btn-light ml-25" data-intent="next">Yes</button>
                    <button type="button" class="btn btn-light" data-intent="close">No</button>
                </div>`,
          'intents': {
            'next': 'phonecall',
            'close': function() {
                jQuery(liveChatButton).fadeIn("slow", function() {
                    jQuery(this).removeClass('hidden');
                });
                jQuery(liveChatLayer).fadeOut("slow", function() {
                    jQuery(this).addClass('hidden');
                });
            }
          },
          'keywords': [
              'fail',
              'error',
              'notfound'
          ]  
        },
        'phonecall': {
          'html': `<div class="inline-block"><img src="` + avatar + `" title="` + avatarTitle + `" class="robo-icon align-bottom"></img></div>
                <div class="inline-block ml-25">Do you like to receive a phone call from ` + master + ` during the next days?</div>
                <div class="inline-block ml-25">
                    <button type="button" class="btn btn-light ml-25" data-intent="next">Yes</button>
                    <button type="button" class="btn btn-light" data-intent="back">No</button>
                </div>`,
          'intents': {
            'next': function() {
                jQuery(liveChatButton).fadeIn("slow", function() {
                    jQuery(this).removeClass('hidden');
                });
                jQuery(liveChatLayer).fadeOut("slow", function() {
                    jQuery(this).addClass('hidden');
                });
                jQuery(formMessageField).html("Hi " + pkLiveChatBot.master + ",\n\nplease call me back.\nI have an important issue to discuss with you.\nMy number is ");
                    jQuery('html, body').animate({
                    scrollTop: jQuery(pkLiveChatBot.formMessageField).offset().top
                }, 2000);
            },
            'back': 'freeinput'
          },
          'keywords': [
              'shedule',
              'call',
              'phone',
              'contact',
              'mobile'
          ]  
        },
        'freeinput': {
          'html': `<div class="inline-block"><img src="` + avatar + `" title="` + avatarTitle + `" class="robo-icon align-bottom"></img></div>
                <div class="inline-block ml-25">How can I help you in details?</div>
                <div class="inline-block ml-25">
                    <textarea id="interpretetext" cols="20" rows="3"></textarea>
                    <button type="button" class="btn btn-light" data-intent="interpretetext">Ask</button>
                </div>`,
          'intents': {
            'interpretetext': function() {
                let text = $('#interpretetext').val();
                pkLiveChatBot.estimateAction(text);
                pkLiveChatBot.render();
            }
          },
          'keywords': [
              'free',
              'input',
              'text',
              'interprete'
          ]  
        },
    }
};

pkLiveChatBot = new PkLiveChatBot(params);
mouseInsideAssistant = false;

jQuery(document).ready(function() {
    pkLiveChatBot.render();

    jQuery('#livechat-button').on('click', function(e) {
        e.stopPropagation();
    
        jQuery(this).fadeOut("slow", function() {
            jQuery(this).addClass('hidden');
        });

        jQuery('#livechat-assistant').fadeIn("slow", function() {
            jQuery('#livechat-assistant').removeClass('hidden');
        });
    });
    
    jQuery("#livechat-assistant").hover(function(){ 
        mouseInsideAssistant=true; 
    }, function(){ 
        mouseInsideAssistant=false; 
    });
    
    jQuery(document).on('mouseup', function () {
        if (!mouseInsideAssistant) {
            jQuery(liveChatButton).fadeIn("slow", function() {
                jQuery(this).removeClass('hidden');
            });
            jQuery(liveChatLayer).fadeOut("slow", function() {
                jQuery(this).addClass('hidden');
            });
        }
    });
    
    timeout = null;
    jQuery(document).on('mousemove', function() {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        
        timeout = setTimeout(function() {
            if (jQuery("#livechat-button").hasClass('hidden') && jQuery("#livechat-assistant").hasClass('hidden')) {
                jQuery("#livechat-assistant").fadeIn("slow", function() {
                    jQuery("#livechat-assistant").removeClass('hidden');
                });
            }
        }, 5000);
    });
});
