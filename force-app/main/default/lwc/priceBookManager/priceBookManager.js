import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import D3 from '@salesforce/resourceUrl/D3Lib';
import { loadScript } from 'lightning/platformResourceLoader';
import pricebooksInit from '@salesforce/apex/PriceBookController.initPriceBooks';

export default class PriceBookManager extends LightningElement {
    
    @track selectedId;
    @track selectedName;
    @track selectedProdType;
    @track selectedStartDate;
    @track selectedEndDate;
    @track selectedIsActive;

    svgWidth = 1180;
    svgInnerHeight = 480;
    svgHeight = 620;
    @track chartData = [];
    @track strDates = [];
    @track pricebooks = [];

    connectedCallback() {
        pricebooksInit()
            .then(data => {
                this.pricebooks = JSON.parse(data);
                this.prepareData();           
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

    initChart() {
        Promise.all([
            loadScript(this, D3 + '/package/dist/d3.min.js')
        ]).then(async () => {
            await pricebooksInit()
                .then(data => {
                    this.pricebooks = JSON.parse(data);
                    this.prepareData();           
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

    prepareData() {
        this.chartData = [];
        this.strDates = [];
        for(let item of this.pricebooks) {
            if(item.name !== 'Standard Price Book') {
                let d = new Date(item.endDate);
                d.setDate(d.getDate() + 1);
                this.chartData.push({
                    name: item.name,
                    start: new Date(item.startDate),
                    end: d,
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
    }

    renderedCallback() {
        Promise.all([
            loadScript(this, D3 + '/package/dist/d3.min.js')
        ]).then(async () => {
            await pricebooksInit()
                .then(data => {
                    this.pricebooks = JSON.parse(data);
                    this.prepareData();           
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

    handlePricebookSelect(event) {
        this.selectedId = event.detail.id;
        this.selectedName = event.detail.name;
        this.selectedProdType = event.detail.prodType;
        if(this.selectedProdType == null) {
            this.selectedProdType = 'Standard';
        }
        this.selectedStartDate = event.detail.startDate;
        if(this.selectedStartDate == null) {
            this.selectedStartDate = 'undefined';
        }
        this.selectedEndDate = event.detail.endDate;
        if(this.selectedEndDate == null) {
            this.selectedEndDate = 'undefined';
        }
        this.selectedIsActive = event.detail.isActive;
        this.template.querySelector('c-product-list').getNewProducts();     
    }

    handlePBEdit() {
        this.template.querySelector('c-price-book-list').fetchPricebooks();
    }

    drawChart() {
        const svg = d3.select(this.template.querySelector('svg.d3-1'))
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
            .attr('transform', 'translate(0, 30)')
            .call(xAxisGrid);
            
        svg.append('g')
            .attr('class', 'y axis-grid')
            .attr('transform', 'translate(144, 0)')
            .call(yAxisGrid);

        let xAxis = d3.axisTop()
            .scale(xScale)
            .ticks(d3.timeDay.every(2))
            .tickFormat(d => d3.timeFormat('%d.%m')(d));

        svg.append('g').attr('transform', 'translate(0, 30)').style('font-size', '12px').call(xAxis);

        let yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(this.chartData.length);

        svg.append('g').attr('transform', 'translate(144, 0)').style('font-size', '12px').call(yAxis);

        const barsGroup = svg.append('g');
        barsGroup.selectAll('rect')
            .data(this.chartData)
            .enter()
            .append('rect')
            .attr('x', d => xScale(d.start))
            .attr('y', d => yScale(d.name))
            .attr('width', d => xScale(d.end) - xScale(d.start))
            .attr('height', yScale.bandwidth() - 40)
            .attr('transform', 'translate(0, 20)')
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

        svg.append('circle').attr('cx',144).attr('cy',540).attr('r', 6).style('fill', d3.rgb(73, 230, 133));
        svg.append('circle').attr('cx',144).attr('cy',570).attr('r', 6).style('fill', d3.rgb(73, 190, 230));
        svg.append('circle').attr('cx',144).attr('cy',600).attr('r', 6).style('fill', d3.rgb(145, 148, 146));
        svg.append('text').attr('x', 164).attr('y', 540).text('Business Premises Price Books').style('font-size', '15px').attr('alignment-baseline','middle');
        svg.append('text').attr('x', 164).attr('y', 570).text('Apartments Price Books').style('font-size', '15px').attr('alignment-baseline','middle');
        svg.append('text').attr('x', 164).attr('y', 600).text('Standard Price Book').style('font-size', '15px').attr('alignment-baseline','middle'); 
    }
}