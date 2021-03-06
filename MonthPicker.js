/*
https://github.com/KidSysco/jquery-ui-month-picker/

Version 2.2mrj

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation;
version 3.0. This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public
License along with this library; if not, visit
http://www.gnu.org/licenses/old-licenses/lgpl-2.1.txt.
*/
;
(function ($, window, document, undefined) {
    var _markup;
    var _speed = 500;
    var _disabledClass = 'month-picker-disabled';
    var _inputMask = '99/9999';
    
    $.MonthPicker = {
        i18n: {
            year: "Year",
            prevYear: "Previous Year",
            nextYear: "Next Year",
            next5Years: 'Jump Forward 5 Years',
            prev5Years: 'Jump Back 5 Years',
            nextLabel: "Next",
            prevLabel: "Prev",
            buttonText: "Open Month Chooser",
            jumpYears: "Jump Years",
            months: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.']
        }
    };
    
    _markup =
        '<div class="ui-widget-header ui-helper-clearfix ui-corner-all">' +
            '<table class="month-picker-year-table" width="100%" border="0" cellspacing="1" cellpadding="2">' +
                '<tr>' +
                    '<td class="previous-year"><button>&nbsp;</button></td>' +
                    '<td class="year-container-all">' +
                        '<div class="year-title"></div>' +
                        '<div id="year-container"><span class="year"></span></div>' +
                    '</td>' +
                    '<td class="next-year"><button>&nbsp;</button></td>' +
                '</tr>' +
            '</table>' +
        '</div>' +
        '<div class="ui-widget ui-widget-content ui-helper-clearfix ui-corner-all">' +
            '<table class="month-picker-month-table" width="100%" border="0" cellspacing="1" cellpadding="2">' +
                '<tr>' +
                    '<td><button type="button" class="button-1"></button></td>' +
                    '<td><button class="button-2" type="button"></button></td>' +
                    '<td><button class="button-3" type="button"></button></td>' +
                '</tr>' +
                '<tr>' +
                    '<td><button class="button-4" type="button"></button></td>' +
                    '<td><button class="button-5" type="button"></button></td>' +
                    '<td><button class="button-6" type="button"></button></td>' +
                '</tr>' +
                '<tr>' +
                    '<td><button class="button-7" type="button"></button></td>' +
                    '<td><button class="button-8" type="button"></button></td>' +
                    '<td><button class="button-9" type="button"></button></td>' +
                '</tr>' +
                '<tr>' +
                    '<td><button class="button-10" type="button"></button></td>' +
                    '<td><button class="button-11" type="button"></button></td>' +
                    '<td><button class="button-12" type="button"></button></td>' +
                '</tr>' +
            '</table>' +
        '</div>';

    $.widget("KidSysco.MonthPicker", {

        /******* Properties *******/

        options: {
            i18n: null,
            StartYear: null,
            EarliestMonthSelectable: null,
            LatestMonthSelectable: null,
            ShowIcon: true,
            AlwaysShown: false,
            UseInputMask: false,
            ValidationErrorMessage: null,
            Disabled: false,
            OnAfterMenuOpen: null,
            OnAfterMenuClose: null,
            OnAfterNextYear: null,
            OnAfterNextYears: null,
            OnAfterPreviousYear: null,
            OnAfterPreviousYears: null,
            OnAfterChooseMonth: null,
            OnAfterChooseYear: null,
            OnAfterChooseYears: null,
            OnAfterChooseMonths: null,
            
            _earliestYear: -9999,
            _earliestMonth: null,
            _latestYear: 9999,
            _latestMonth: null
        },

        _monthPickerMenu: null,

        _monthPickerButton: null,

        _validationMessage: null,

        _yearContainer: null,
        
        _isMonthInputType: null,
        
        _enum: {
            _overrideStartYear: 'MonthPicker_OverrideStartYear'
        },

        /******* jQuery UI Widget Factory Overrides ********/

        _destroy: function () {
            if (jQuery.mask && this.options.UseInputMask) {
                this.element.unmask();
            }

            this.element.val('')
                .css('color', '')
                .removeClass('month-year-input')
                .removeData(this._enum._overrideStartYear)
                .unbind();

            $(document).unbind('click.MonthPicker' + this.element.attr('id'), $.proxy(this._hide, this));

            this._monthPickerMenu.remove();
            this._monthPickerMenu = null;

            if (this.monthPickerButton) {
                this._monthPickerButton.remove();
                this._monthPickerButton = null;
            }

            if (this._validationMessage) {
                this._validationMessage.remove();
                this._validationMessage = null;
            }
        },

        _setOption: function (key, value) {
            // In jQuery UI 1.8, manually invoke the _setOption method from the base widget.
            //$.Widget.prototype._setOption.apply(this, arguments);
            // In jQuery UI 1.9 and above, you use the _super method instead.
            this._super("_setOption", key, value);
            switch (key) {
                case 'i18n':
                    this.options.i18n = $.extend({}, value);
                    break;
                case 'Disabled':
                    this.options.Disabled = value;
                    this._setDisabledState();
                    break;
                case 'OnAfterChooseMonth':
                    this.options.OnAfterChooseMonth = value;
                    break;
                case 'OnAfterChooseMonths':
                    this.options.OnAfterChooseMonths = value;
                    break;
                case 'OnAfterChooseYear':
                    this.options.OnAfterChooseYear = value;
                    break;
                case 'OnAfterChooseYears':
                    this.options.OnAfterChooseYears = value;
                    break;
                case 'OnAfterMenuClose':
                    this.options.OnAfterMenuClose = value;
                    break;
                case 'OnAfterMenuOpen':
                    this.options.OnAfterMenuOpen = value;
                    break;
                case 'OnAfterNextYear':
                    this.options.OnAfterNextYear = value;
                    break;
                case 'OnAfterNextYears':
                    this.options.OnAfterNextYears = value;
                    break;
                case 'OnAfterPreviousYear':
                    this.options.OnAfterPreviousYear = value;
                    break;
                case 'OnAfterPreviousYears':
                    this.options.OnAfterPreviousYears = value;
                    break;
                case 'UseInputMask':
                    this.options.UseInputMask = value;
                    this._setUseInputMask();
                    break;
                case 'StartYear':
                    this.options.StartYear = value;
                    this._setStartYear();
                    if (value !== null) {
                        this._setPickerYear(value);
                    }
                    break;
                case 'EarliestMonthSelectable':
                    this.options.EarliestMonthSelectable = value;
                    this._setEarliestMonthSelectable(this._getPickerYear());
                    break;
                case 'LatestMonthSelectable':
                    this.options.LatestMonthSelectable = value;
                    this._setLatestMonthSelectable(this._getPickerYear());
                    break;
                case 'ShowIcon':
                    this.options.ShowIcon = value;
                    this._showIcon();
                    break;
                case 'AlwaysShown':
                    this.options.AlwaysShown = !!value;
                    break;
                case 'ValidationErrorMessage':
                    this.options.ValidationErrorMessage = value;
                    if (this.options.ValidationErrorMessage !== null) {
                        this._createValidationMessage();
                    } else {
                        this._removeValidationMessage();
                    }

                    break;
            }
        },

        _init: function () {
            if (!jQuery.ui || !jQuery.ui.button || !jQuery.ui.datepicker) {
                alert('MonthPicker Setup Error: The jQuery UI button and datepicker plug-ins must be loaded before MonthPicker is called.');
                return false;
            }

            if (!(this.element.is('input[type="text"]') || this.element.is('input[type="month"]'))) {
                alert('MonthPicker Setup Error: MonthPicker can only be called on text or month inputs. ' + this.element.attr('id') + ' is not a text or month input.');
                return false;
            }

            if (!jQuery.mask && this.options.UseInputMask) {
                alert('MonthPicker Setup Error: The UseInputMask option is set but the Digital Bush Input Mask jQuery Plugin is not loaded. Get the plugin from http://digitalbush.com/');
                return false;
            }
            
            if (this.element.is('input[type="month"]')) {
                this.element.css('width', 'auto');
                this._isMonthInputType = true;
            }else{
                 this._isMonthInputType = false;   
            }

            this.element.addClass('month-year-input');

            this._setStartYear();

            this._monthPickerMenu = $('<div id="MonthPicker_' + this.element.attr('id') + '" class="month-picker ui-helper-clearfix"></div>');

            $(_markup).appendTo(this._monthPickerMenu);
            $('body').append(this._monthPickerMenu);

            this._monthPickerMenu.find('.year-title').text(this._i18n('year'));
            this._monthPickerMenu.find('.year-container-all').attr('title', this._i18n('jumpYears'));

            this._showIcon();

            this._createValidationMessage();

            this._yearContainer = $('.year', this._monthPickerMenu);

            $('.previous-year button', this._monthPickerMenu)
                .button({
                icons: {
                    primary: 'ui-icon-circle-triangle-w'
                },
                text: false
            });
            $('.previous-year button span.ui-button-icon-primary').text(this._i18n('prevLabel'));
             
            $('.next-year button', this._monthPickerMenu)
                .button({
                icons: {
                    primary: 'ui-icon-circle-triangle-e'
                },
                text: false
            });
            $('.next-year button span.ui-button-icon-primary').text(this._i18n('nextLabel'));

            $('.month-picker-month-table td button', this._monthPickerMenu).button();

            $('.year-container-all', this._monthPickerMenu).click($.proxy(this._showYearsClickHandler, this));

            $(document).bind('click.MonthPicker' + this.element.attr('id'), $.proxy(this._hide, this));
            this._monthPickerMenu.bind('click.MonthPicker', function (event) {
                return false;
            });
            
            this._setUseInputMask();
            this._setDisabledState();
            
            if (this.options.AlwaysShown) this._show();
        },

        /****** Misc. Utility functions ******/

        _i18n: function(str) {
            return $.extend({}, $.MonthPicker.i18n, this.options.i18n)[str];
        },

        _isFunction: function (func) {
            return typeof (func) === 'function';
        },

        /****** Publicly Accessible API functions ******/

        GetSelectedYear: function () {
            return this._validateYear(this.element.val());
        },

        GetSelectedMonth: function () {
            return this._validateMonth(this.element.val());
        },

        GetSelectedMonthYear: function () {
            var _month = this._validateMonth(this.element.val()),
                _year = this._validateYear(this.element.val()), 
                _date;

            if (!isNaN(_year) && !isNaN(_month)) {
                if (this.options.ValidationErrorMessage !== null && !this.options.Disabled) {
                    $('#MonthPicker_Validation_' + this.element.attr('id')).hide();
                }
                
                if(this._isMonthInputType){
                    _date = _year + '-' + _month;
                }else{
                    _date = _month + '/' + _year;
                }
                
                $(this).val(_date);
                return _date;
            } else {
                if (this.options.ValidationErrorMessage !== null && !this.options.Disabled) {
                    $('#MonthPicker_Validation_' + this.element.attr('id')).show();
                }

                return null;
            }
        },

        Disable: function () {
            this._setOption("Disabled", true);
        },

        Enable: function () {
            this._setOption("Disabled", false);
        },

        ClearAllCallbacks: function () {
            this.options.OnAfterChooseMonth = null;
            this.options.OnAfterChooseMonths = null;
            this.options.OnAfterChooseYear = null;
            this.options.OnAfterChooseYears = null;
            this.options.OnAfterMenuClose = null;
            this.options.OnAfterMenuOpen = null;
            this.options.OnAfterNextYear = null;
            this.options.OnAfterNextYears = null;
            this.options.OnAfterPreviousYear = null;
            this.options.OnAfterPreviousYears = null;
        },

        Clear: function () {
            this.element.val('');

            if (this._validationMessage !== null) {
                this._validationMessage.hide();
            }
        },

        /****** Private functions ******/

        _showIcon: function () {
            if (this._monthPickerButton === null) {
                if (this.options.ShowIcon) {
                    this._monthPickerButton = $('<span id="MonthPicker_Button_' + this.element.attr('id') + '" class="month-picker-open-button">' + this._i18n('buttonText') + '</span>').insertAfter(this.element);
                    this._monthPickerButton.button({
                        text: false,
                        icons: {
                            primary: 'ui-icon-calculator'
                        }
                    })
                        .click($.proxy(this._show, this));
                } else {
                    this.element.bind('click.MonthPicker', $.proxy(this._show, this));
                }
            } else {
                if (!this.options.ShowIcon) {
                    this._monthPickerButton.remove();
                    this._monthPickerButton = null;
                    this.element.bind('click.MonthPicker', $.proxy(this._show, this));
                }
            }
        },

        _createValidationMessage: function () {
            if (this.options.ValidationErrorMessage !== null && this.options.ValidationErrorMessage !== '') {
                this._validationMessage = $('<span id="MonthPicker_Validation_' + this.element.attr('id') + '" class="month-picker-invalid-message">' + this.options.ValidationErrorMessage + '</span>');

                this._validationMessage.insertAfter(this.options.ShowIcon ? this.element.next() : this.element);

                this.element.blur($.proxy(this.GetSelectedMonthYear, this));
            }
        },

        _removeValidationMessage: function () {
            if (this.options.ValidationErrorMessage === null) {
                this._validationMessage.remove();
                this._validationMessage = null;
            }
        },

        _show: function () {
            var _selectedYear = this.GetSelectedYear();
            var _year;
            if (this.element.data(this._enum._overrideStartYear) !== undefined) {
                _year = this.options.StartYear;
            } else if (!isNaN(_selectedYear)) {
                _year = _selectedYear;
            } else {
                _year = new Date().getFullYear();
            }
            
            this._showMonths();
            this._setPickerYear(_year);
            this._setEarliestMonthSelectable(_year);
            this._setLatestMonthSelectable(_year);

            if (this._monthPickerMenu.css('display') === 'none') {
                var _fieldIsHidden = this.element.is(':hidden');
                var _anchor = _fieldIsHidden ? this.element.parent() : this.element;
                var _top = _anchor.offset().top + (_fieldIsHidden ? 0 : this.element.height() + 7);
                var _left = _anchor.offset().left;

                this._monthPickerMenu.css({
                    top: _top + 'px',
                    left: _left + 'px'
                })
                    .slideDown(_speed, $.proxy(function () {
                    if (this._isFunction(this.options.OnAfterMenuOpen)) {
                        this.options.OnAfterMenuOpen();
                    }
                }, this));
            }

            return false;
        },

        _hide: function () {
            if (!this.options.AlwaysShown && this._monthPickerMenu.css('display') === 'block') {
                this._monthPickerMenu.slideUp(_speed, $.proxy(function () {
                    if (this._isFunction(this.options.OnAfterMenuClose)) {
                        this.options.OnAfterMenuClose();
                    }
                }, this));
            }
        },

        _setUseInputMask: function () {
            if (!this._isMonthInputType) {
                try {
                    if (this.options.UseInputMask) {
                        this.element.mask(_inputMask);
                    } else {
                        this.element.unmask();
                    }
                } catch (e) {}
            }
        },

        _setDisabledState: function () {
            if (this.options.Disabled) {
                this.element.prop('disabled', true);
                this.element.addClass(_disabledClass);
                if (this._monthPickerButton !== null) {
                    this._monthPickerButton.button('option', 'disabled', true);
                }

                if (this._validationMessage !== null) {
                    this._validationMessage.hide();
                }

            } else {
                this.element.prop('disabled', false);
                this.element.removeClass(_disabledClass);
                if (this._monthPickerButton !== null) {
                    this._monthPickerButton.button('option', 'disabled', false);
                }
            }
        },

        _setStartYear: function () {
            if (this.options.StartYear !== null) {
                this.element.data(this._enum._overrideStartYear, true);
            } else {
                this.element.removeData(this._enum._overrideStartYear);
            }
        },
        
         _setEarliestMonthSelectable: function (year) {
             if (this.options.EarliestMonthSelectable) {
                 this.options._earliestYear = this._validateYear(this.options.EarliestMonthSelectable);
                 this.options._earliestMonth = this._validateMonth(this.options.EarliestMonthSelectable);
                 if (isNaN(this.options._earliestYear) || isNaN(this.options._earliestMonth)) {
                     this.options._earliestYear = -9999;
                     this.options._earliestMonth = 0;
                 } else if (year <= this.options._earliestYear) {
                     this._setPickerYear(this.options._earliestYear);
                 }
             }
        },   
        
        _setLatestMonthSelectable: function (year) {
            if (this.options.LatestMonthSelectable) {
                this.options._latestYear = this._validateYear(this.options.LatestMonthSelectable);
                this.options._latestMonth = this._validateMonth(this.options.LatestMonthSelectable);
                if (isNaN(this.options._latestYear) || isNaN(this.options._latestMonth)) {
                    this.options._latestYear = 9999;
                    this.options._latestMonth = 12;
                 } else if (year >= this.options._latestYear) {
                    this._setPickerYear(this.options._latestYear);
                 }
            }
        },
        
        _getPickerYear: function () {
            return parseInt(this._yearContainer.text(), 10);
        },

        _setPickerYear: function (year) {
            this._yearContainer.text(year);
            this._setYear(year);
        },

        _validateMonth: function (text) {
            if (text === '') {
                return NaN;
            }

            if (text.indexOf('/') != -1) {
                var _month = parseInt(text.split('/')[0], 10);
                if (!isNaN(_month)) {
                    if (_month >= 1 && _month <= 12) {
                        return _month;
                    }
                }
            }
            
            if (text.indexOf('-') != -1) {
                var _month = parseInt(text.split('-')[1], 10);
                if (!isNaN(_month)) {
                    if (_month >= 1 && _month <= 12) {
                        return _month;
                    }
                }
            }

            return NaN;
        },

        _validateYear: function (text) {
            if (text === '') {
                return NaN;
            }

            if (text.indexOf('/') != -1) {
                var _year = parseInt(text.split('/')[1], 10);

                if (!isNaN(_year)) {
                    if (_year >= 1800 && _year <= 3000) {
                        return _year;
                    }
                }
            }
            
            if (text.indexOf('-') != -1) {
                var _year = parseInt(text.split('-')[0], 10);

                if (!isNaN(_year)) {
                    if (_year >= 1800 && _year <= 3000) {
                        return _year;
                    }
                }
            }

            return NaN;
        },

        _chooseMonth: function (month) {
            if (month > 0 && month < 10) {
                month = '0' + month;
            }

            if (this.element.is('input[type="month"]')) {
                this.element.val(this._getPickerYear() + '-' + month).change();
            }else{
                this.element.val(month + '/' + this._getPickerYear()).change();
            }
            
            this._highlightMonth(this.GetSelectedYear());
            
            this.element.blur();
            if (this._isFunction(this.options.OnAfterChooseMonth)) {
                this.options.OnAfterChooseMonth();
            }
        },

        _chooseYear: function (year) {
            this._setPickerYear(year);
            this._showMonths();
            if (this._isFunction(this.options.OnAfterChooseYear)) {
                this.options.OnAfterChooseYear();
            }
        },

        _showMonths: function () {
            var _months = this._i18n('months');

            $('.previous-year button', this._monthPickerMenu)
                .attr('title', this._i18n('prevYear'))
                .unbind('click')
                .bind('click.MonthPicker', $.proxy(this._previousYear, this));

            $('.next-year button', this._monthPickerMenu)
                .attr('title', this._i18n('nextYear'))
                .unbind('click')
                .bind('click.MonthPicker', $.proxy(this._nextYear, this));

            $('.year-container-all', this._monthPickerMenu).css('cursor', 'pointer');
            $('.year', this._monthPickerMenu).toggle(true);
            $('.month-picker-month-table button', this._monthPickerMenu).unbind('.MonthPicker');
            
            for (var _month in _months) {
                var _counter = parseInt(_month, 10) + 1;
                $('.button-' + _counter, this._monthPickerMenu)
                    .bind('click.MonthPicker', {
                    _month: _counter
                }, $.proxy(function (event) {
                    this._chooseMonth(event.data._month);
                    this._hide();
                }, this));

                $('.button-' + _counter, this._monthPickerMenu).button('option', 'label', _months[_month]);
            }
        },

        _showYearsClickHandler: function () {

            this._showYears();
            if (this._isFunction(this.options.OnAfterChooseYears)) {
                this.options.OnAfterChooseYears();
            }
        },

        _showYears: function () {
            var _year = this._getPickerYear();

            $('.previous-year button', this._monthPickerMenu)
                .attr('title', this._i18n('prev5Years'))
                .unbind('click')
                .bind('click', $.proxy(function () {
                this._previousYears();
                return false;
            }, this));

            $('.next-year button', this._monthPickerMenu)
                .attr('title', this._i18n('next5Years'))
                .unbind('click')
                .bind('click', $.proxy(function () {
                this._nextYears();
                return false;
            }, this));

            $('.year-container-all', this._monthPickerMenu).css('cursor', 'default');
            $('.year', this._monthPickerMenu).toggle(false);
            $('.month-picker-month-table button', this._monthPickerMenu).unbind('.MonthPicker');

            var _yearDifferential = -4;
            for (var _counter = 1; _counter <= 12; _counter++) {
                $('.button-' + _counter, this._monthPickerMenu)
                    .bind('click.MonthPicker', {
                    _yearDiff: _yearDifferential
                }, $.proxy(function (event) {
                    this._chooseYear(_year + event.data._yearDiff);
                }, this));

                $('.button-' + _counter, this._monthPickerMenu).button('option', 'label', _year + _yearDifferential);

                _yearDifferential++;
            }
            this._setYear(_year, true);
        },

        _nextYear: function () {
            var _year = $('.month-picker-year-table .year', this._monthPickerMenu);
            var _newYear = parseInt(_year.text()) + 1;
            _year.text(_newYear, 10);
            this._setYear(_newYear);
            if (this._isFunction(this.options.OnAfterNextYear)) {
                this.options.OnAfterNextYear();
            }
        },

        _nextYears: function () {
            var _year = $('.month-picker-year-table .year', this._monthPickerMenu);
            _year.text(parseInt(_year.text()) + 5, 10);
            this._showYears();
            if (this._isFunction(this.options.OnAfterNextYears)) {
                this.options.OnAfterNextYears();
            }
        },

        _previousYears: function () {
            var _year = $('.month-picker-year-table .year', this._monthPickerMenu);
            _year.text(parseInt(_year.text()) - 5, 10);
            this._showYears();
            if (this._isFunction(this.options.OnAfterPreviousYears)) {
                this.options.OnAfterPreviousYears();
            }
        },

        _previousYear: function () {
            var _year = $('.month-picker-year-table .year', this._monthPickerMenu);
            var _newYear = parseInt(_year.text()) - 1;
            _year.text(_newYear, 10);
            this._setYear(_newYear);
            if (this._isFunction(this.options.OnAfterPreviousYear)) {
                this.options.OnAfterPreviousYear();
            }
        },
        
        _setVisibility: function(cssClass, isVisible) {
           $('.' + cssClass, this._monthPickerMenu).css('visibility', isVisible ? 'visible' : 'hidden');
        },
        
        _setYear: function(year, toYearPicker) {
            if (this.options._earliestYear != -9999 || this.options._latestYear != 9999) {
              var _monthTable = $('.month-picker-month-table', this._monthPickerMenu);
              $('button', _monthTable).toggle(true);
  
              var _showNextPageButton = year+(toYearPicker ? 7 : 0) < this.options._latestYear;
              this._setVisibility('next-year', _showNextPageButton);
              
              if (!_showNextPageButton) {
                var _hideAboveThresh = toYearPicker ? this.options._latestYear-year+4 : this.options._latestMonth-1;
                $('button:gt(' + _hideAboveThresh + ')', _monthTable).toggle(false);
              }
  
              var _showPreviousPageButton = year-(toYearPicker ? 4 : 0) > this.options._earliestYear;
              this._setVisibility('previous-year', _showPreviousPageButton);
  
              if (!_showPreviousPageButton) {
                var _hideBelowThresh = toYearPicker ? this.options._earliestYear-year+4 : this.options._earliestMonth-1;
                $('button:lt(' + _hideBelowThresh + ')', _monthTable).toggle(false);
              }
            }
            this._highlightMonth(toYearPicker ? NaN : year);
        },
        
        _highlightMonth: function (year) {
          $('button.selected', this._monthPickerMenu).removeClass('selected');
          if (year == this.GetSelectedYear()) {
            var _selectedMonth = this.GetSelectedMonth();
            if (!isNaN(_selectedMonth)) {
              $('.button-' + _selectedMonth, this._monthPickerMenu).addClass('selected');
            }
          }
        }
    });
}(jQuery, window, document));
