var BubbleMap = (function(){
    function BubbleMap(data, elem, width, height, minRadius, maxRadius){
        this.width = width;
        this.height = height;
        this.elem = elem[0];
        this.data = data;
        this.minRadius = minRadius;
        this.maxRadius = maxRadius;
        this.init();
        this.drawCountries();
    }

    BubbleMap.prototype.init = function(){
        var self = this;
        this.height = 960;

        this.projection = d3.geo.mercator()
            .center([10, 5 ])
            .scale(150);

        this.svg = d3.select(this.elem).append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        this.path = d3.geo.path()
            .projection(this.projection);

        this.g = this.svg.append("g");

        this.legend = this.svg.append('g');

    };


    BubbleMap.prototype._drawBubbles = function() {
        var self = this;
        d3.tsv('center.csv', function(data) {
            var centers = data;
            draw.call(self, centers);
        });

        function draw(centers){
            var minRadius = this.minRadius, maxRadius = this.maxRadius,
                getLatLong = function(iso) {
                    return _.find(centers, function(c){
                        return c.iso === iso;
                    });
                };

            var minCount = _.min(this.data, function(d){
                    return d.count;
                }).count,
                maxCount = _.max(this.data, function(d){
                    return d.count;
                }).count,
                nodes = _.chain(this.data)
                    .groupBy(function(d){
                        return d.country;
                    })
                    .map(function(val, key){
                        //Get to pack layout format;
                        var values = _.chain(val)
                            .sortBy(val, function(a, b){
                                return a.name - b.name;
                            })
                            .map(function(v){
                                var normalizedCount = self.normalize(
                                    v.count,
                                    minRadius,
                                    maxRadius,
                                    minCount,
                                    maxCount
                                );
                                return _.extend(v, {normalizedCount: normalizedCount})
                            })
                            .value();
                        return {name: key, children: values}
                    })
                    .map(function(d, i){
                        return self._packLayoutData(d);
                    })
                    .flatten()
                    .filter(function(d){
                        return d.children === undefined;
                    })
                    .value();
            this.nodes = nodes;


            var nameColorMap = _.chain(nodes)
                .uniq(function(r){
                    return r.name;
                })
                .map(function(d, i){
                    return [d.name, d.color];
                })
                .object()
                .value();
            this._addLegend(nameColorMap);

            this.g.append('g')
                .selectAll("circle")
                .data(nodes)
                .enter()
                .append("a")
                .append("circle")
                .attr("cx", function(d) {
                    try{
                        var centerLatLong = getLatLong(d.country);
                        return self.projection([centerLatLong.long, centerLatLong.lat])[0] - d.x;
                    } catch(e){
                        console.warn('COuntry not found: ' + d.country);
                    }

                })
                .attr("cy", function(d) {
                    try{
                        var centerLatLong = getLatLong(d.country);
                        return self.projection([centerLatLong.long, centerLatLong.lat])[1] - d.y;
                    } catch(e){
                        //console.warn('er');
                    }

                })
                .attr("r", function(d){
                    return d.r;
                })
                .attr("class", "bubble")
                .style("fill", function(d, i){
                    return nameColorMap[d.name];
                });

        }

    };

    BubbleMap.prototype._packLayoutData = function(data) {
        var padding = -5;

        // Pack layout
        var pack = d3.layout.pack()
            .sort(function(a, b){
                return b.count - a.count;
            })
            .padding(padding)
            .value(function(d){
                return d.normalizedCount;
            })
            .radius(function(d){
                return d;
            });

        return pack.nodes(data);
    };

    BubbleMap.prototype.normalize = function(value, minRange, maxRange, minValue, maxValue){
        if(value === 0) return 0;
        if(maxValue === minValue) return maxRange;
        return minRange + ((value - minValue) * (maxRange - minRange) / (maxValue - minValue));
    };

    BubbleMap.prototype.drawCountries = function(){
        var self = this;
        d3.json("world-map_wo_ant.json", function(error, topology) {
            self.topology = topology;
            self.g.selectAll("path")
                .data(topojson.feature(topology, topology.objects.subunits).features)
                .enter()
                .append("path")
                .attr("d", self.path)
                .filter(function(d){
                    return d.properties.iso_a2 != 'GS';
                })
                .attr('class', 'feature')
                .attr('title', function(d){
                    return d.properties.name;
                })
                .on('click', function(d){
                    self.removeTooltip();
                });
            self._drawBubbles();
        });
    };

    BubbleMap.prototype._addLegend = function(data){
        var legend = this.legend
            .selectAll('.legend')
            .data(d3.keys(data))
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr('transform', 'translate(50,500)');

        legend.append('circle')
            .attr('r', 5)
            .attr('cx', function(d, i){
                return i * 100;
            })
            .style('fill', function(key){
                return data[key];
            });

        legend.append('text')
            .attr('x', function(d, i){return (i * 100) + 10})
            .attr('y', 5)
            .text(function(d) {
                if(d.length > 10) {
                    return d.substring(0, 10) + '...';
                }
                return d;
            });

    };

    return BubbleMap;
})();

