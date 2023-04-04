import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import pricebooksInit from '@salesforce/apex/PriceBookController.initPriceBooks';
import pricebooksSearch from '@salesforce/apex/PriceBookController.searchPriceBooks';
import pricebookCreate from '@salesforce/apex/PriceBookController.createPriceBook';
import D3 from '@salesforce/resourceUrl/D3Lib';
import { loadScript } from 'lightning/platformResourceLoader';

export default class PriceBookList extends LightningElement {
    
    @track pricebooks = [];
    @track error = null;
    @track pricebookSearch;
    @track showCreateModal = false;
    @track showChartModal = false;
    @track newPricebookName;
    @track newPricebookStartDate;
    @track newPricebookEndDate;
    @track newPricebookProductType = 'Business Premises';
    @api isUpdate = false;
    @track todayDate;
    @track chartData = [];
    @track strDates = [];
    svgWidth = 1180;
    svgInnerHeight = 480;
    svgHeight = 620;

    get productTypes() {
        return [
            { value: 'Business Premises', label: 'Business Premises' },
            { value: 'Apartments', label: 'Apartments' }
        ];
    }

    get arePriceBooks() {
        let flag = true;
        if(this.pricebooks.length == 0) {
            flag = false;
        } else if(this.pricebooks.length != 0) {
            flag = true;
        }
        return flag;
    }

    init() {
        pricebooksInit()
            .then(data => {
                this.pricebooks = JSON.parse(data);
                this.chartData = [];
                for(let item of this.pricebooks) {
                    if(item.name !== 'Standard Price Book') {
                        this.chartData.push({
                            name: item.name,
                            start: new Date(item.startDate),
                            end: new Date(item.endDate),
                            type: item.productType
                        });
                    }         
                }
                this.chartData.sort(function compare(a, b) {
                    return a.start - b.start;
                });
                for(let i = 0; i < this.chartData.length - 1; i++) {
                    if(this.chartData[i].end !== this.chartData[i + 1].start) {
                        this.strDates.push({
                            startStd: this.chartData[i].end,
                            endStd: this.chartData[i + 1].start
                        });
                    }
                }           
            })
            .catch(error => {
                this.error = error;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: this.error,
                        variant: 'error'
                    })
                );
            })
    }

    connectedCallback() {
        this.init();
    }

    renderedCallback() {
        Promise.all([
            loadScript(this, D3 + '/package/dist/d3.min.js')
        ]).then(() => {
            this.drawChart();      
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Error loading D3 library',
                    variant: 'error'
                })
            );
        });
    }

    handleSearchPricebooks(event) {
        this.pricebookSearch = event.target.value;
        pricebooksSearch({name: this.pricebookSearch})
            .then(result => {              
                this.pricebooks = JSON.parse(result);
            })
            .catch(error => {
                this.error = error;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: this.error,
                        variant: 'error'
                    })
                );
            })
    }

    displayCreateModal() {
        this.showCreateModal = true;
    }

    displayChartModal() {
        this.showChartModal = true;
    }

    handleCancel() {
        this.showCreateModal = false;
        this.showChartModal = false;
    }

    handleNewPricebookNameChange(event) {
        this.newPricebookName = event.target.value;
    }

    handleNewPricebookStartDateChange(event) {
        this.newPricebookStartDate = event.target.value;
    }

    handleNewPricebookEndDateChange(event) {
        this.newPricebookEndDate = event.target.value;
    }

    handleNewPricebookProductTypeChange(event) {
        this.newPricebookProductType = event.target.value;
    }

    @api
    fetchPricebooks() {
        this.init();
        this.dispatchEvent(
            new CustomEvent('refreshpricebook')
        );
    }

    handleInsert() {
        let d = new Date();
        d.setDate(d.getDate() - 1);
        this.todayDate = d.toISOString();
        if(this.newPricebookName == null || this.newPricebookStartDate == null || this.newPricebookEndDate == null) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Price Book name, start date and end date cannot be empty',
                    variant: 'error'
                })
            );
        } else {
            if(this.newPricebookStartDate >= this.todayDate) {
                if(this.newPricebookEndDate > this.newPricebookStartDate) {
                    pricebookCreate({
                        name: this.newPricebookName, 
                        startDate: this.newPricebookStartDate, 
                        endDate: this.newPricebookEndDate, 
                        productType: this.newPricebookProductType})
                        .then(result => {
                            let data = JSON.parse(result);
                            if(data.message == '') {
                                this.pricebookSearch = '';
                                this.showCreateModal = false;
                                this.init();
                                this.dispatchEvent(
                                    new ShowToastEvent({
                                        title: 'Success',
                                        message: 'Price Book ' + this.newPricebookName + ' created successfully',
                                        variant: 'success'
                                    })
                                );
                                this.newPricebookName = '';
                                this.newPricebookStartDate = null;
                                this.newPricebookEndDate = null;
                                this.newPricebookProductType = 'Business Premises';
                            } else if(data.message != '') {
                                this.dispatchEvent(
                                    new ShowToastEvent({
                                        title: 'Error',
                                        message: data.message,
                                        variant: 'error'
                                    })
                                );
                            }                         
                        })
                        .catch(error => {
                            this.error = error;
                            this.dispatchEvent(
                                new ShowToastEvent({
                                    title: 'Error',
                                    message: this.error,
                                    variant: 'error'
                                })
                            );
                        })
                } else {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: 'End date should be after start date',
                            variant: 'error'
                        })
                    );
                }
            } else {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Start date should not be before today',
                        variant: 'error'
                    })
                );
            }  
        }              
    }

    handleSelectPricebook(event) {
        this.dispatchEvent(
            new CustomEvent('pricebookselect', {
                detail: {
                    id: event.target.dataset.recordId,
                    name: event.target.dataset.name,
                    prodType: event.target.dataset.prodType,
                    startDate: event.target.dataset.startDate,
                    endDate: event.target.dataset.endDate,
                    isActive: event.target.dataset.isActive,
                }
            })
        );
    }

    drawChart() {
        const svg = d3.select(this.template.querySelector('svg.d3'))
            .attr('width', this.svgWidth)
            .attr('height', this.svgHeight);

        const xScale = d3.scaleTime()
            .domain([d3.min(this.chartData, d => d.start), d3.max(this.chartData, d => d.end)])
            .range([144, this.svgWidth]);

        let yDomain = [...this.chartData.map(d => d.name), 'Standard Price Book'];

        const yScale = d3.scaleBand()
            .domain(yDomain)
            .range([30, this.svgInnerHeight + 30]);
      
        const xAxisGrid = d3.axisBottom(xScale).tickSize(this.svgInnerHeight).tickFormat('').ticks(d3.timeDay.every(1));
        const y = d3.scaleLinear().domain([0, 1]).range([this.svgInnerHeight, 30]);
        const yAxisGrid = d3.axisLeft(yScale).tickSize(-this.svgWidth).tickFormat('').ticks(this.chartData.length);

        svg.append('g')
            .attr('class', 'x axis-grid')
            .attr("transform", "translate(0, 30)")
            .call(xAxisGrid);
            
        svg.append('g')
            .attr('class', 'y axis-grid')
            .attr("transform", "translate(144, 0)")
            .call(yAxisGrid);

        let xAxis = d3.axisTop()
            .scale(xScale)
            .ticks(d3.timeDay.every(2))
            .tickFormat(d => d3.timeFormat('%d.%m')(d));

        svg.append('g').attr("transform", "translate(0, 30)").style('font-size', '12px').call(xAxis);

        let yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(this.chartData.length);

        svg.append('g').attr("transform", "translate(144, 0)").style('font-size', '12px').call(yAxis);

        const barsGroup = svg.append('g');
        barsGroup.selectAll('rect')
            .data(this.chartData)
            .enter()
            .append('rect')
            .attr('x', d => xScale(d.start))
            .attr('y', d => yScale(d.name))
            .attr('width', d => xScale(d.end) - xScale(d.start))
            .attr('height', yScale.bandwidth() - 40)
            .attr("transform", "translate(0, 20)")
            .attr('fill', d => {
                if(d.type === 'Business Premises') {
                    return d3.rgb(73, 230, 133);
                } else if(d.type === 'Apartments') {
                    return d3.rgb(73, 190, 230);
                } else {
                    return d3.rgb(145, 148, 146);
                }
            });

        const stdRects = svg.append('g');
        stdRects.selectAll('rect')
            .data(this.strDates)
            .enter()
            .append('rect')
            .attr('x', d => xScale(d.startStd))
            .attr('y', d => yScale('Standard Price Book'))
            .attr('width', d => xScale(d.endStd) - xScale(d.startStd))
            .attr('height', yScale.bandwidth() - 40)
            .attr('transform', 'translate(0, 20)')
            .attr('fill', d3.rgb(145, 148, 146));

        svg.append("circle").attr("cx",144).attr("cy",540).attr("r", 6).style("fill", d3.rgb(73, 230, 133));
        svg.append("circle").attr("cx",144).attr("cy",570).attr("r", 6).style("fill", d3.rgb(73, 190, 230));
        svg.append("circle").attr("cx",144).attr("cy",600).attr("r", 6).style("fill", d3.rgb(145, 148, 146));
        svg.append("text").attr("x", 164).attr("y", 540).text("Business Premises Price Books").style("font-size", "15px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 164).attr("y", 570).text("Apartments Price Books").style("font-size", "15px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 164).attr("y", 600).text("Standard Price Book").style("font-size", "15px").attr("alignment-baseline","middle");
    }
}