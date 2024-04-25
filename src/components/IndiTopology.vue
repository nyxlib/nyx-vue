<!--suppress CssUnusedSymbol, CssNoGenericFontName, JSUnresolvedReference, PointlessArithmeticExpressionJS -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, onMounted, onUnmounted} from 'vue';

import * as uuid from 'uuid';

import * as d3 from 'd3';

/*--------------------------------------------------------------------------------------------------------------------*/

import useIndiStore from "../stores/indi";

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const indiStore = useIndiStore(window.pinia);

/*--------------------------------------------------------------------------------------------------------------------*/

const TYPE_BROKER = 1;
const TYPE_NODE = 2;
const TYPE_CLIENT = 3;

/*--------------------------------------------------------------------------------------------------------------------*/

const CHARGE_STRENGTH = -500;
const CIRCLE_DIAMETER = 20;

/*--------------------------------------------------------------------------------------------------------------------*/

const svgEl = ref(null);

/*--------------------------------------------------------------------------------------------------------------------*/

let interval = null;

let height = 0;
let width = 0;

let linkLayer = null;
let nodeLayer = null;

let colorScheme = null;
let simulation = null;

/*--------------------------------------------------------------------------------------------------------------------*/

const data = {
    nodes: [],
    links: [],
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const ticked = () => {

    linkLayer.selectAll('line')
             .attr('x1', (d) => d.source.x)
             .attr('y1', (d) => d.source.y)
             .attr('x2', (d) => d.target.x)
             .attr('y2', (d) => d.target.y)
    ;

    nodeLayer.selectAll('g')
             .attr('transform', (d) => `translate(${d.x},${d.y})`)
    ;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const onDragStart = (e, d) => {

    if(!e.active) simulation.alphaTarget(0.3).restart();

    d.fx = d.x;
    d.fy = d.y;
};

const onDrag = (e, d) => {

    d.fx = e.x;
    d.fy = e.y;
};

const onDragEnd = (e, d) => {

    if(!e.active) simulation.alphaTarget(0.0);

    d.fx = null;
    d.fy = null;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const getIconFromType = (type) => {

    switch(type)
    {
        case TYPE_CLIENT:
            return '\uF456';
        case TYPE_BROKER:
            return '\uF411';
        case TYPE_NODE:
            return '\uF40D'
        default:
            return '?';
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const updateLinks = () => {

    const links = linkLayer.selectAll('line').data(data.links);

    const linksEnter = links.enter().append('line').attr('class', 'indi-topology-link');

    linksEnter.merge(links);

    links.exit().remove();
};

/*--------------------------------------------------------------------------------------------------------------------*/

const updateNodes = () => {

    const nodes = nodeLayer.selectAll('g').data(data.nodes);

    const nodesEnter = nodes.enter().append('g').attr('transform', (d) => {

        switch(d.type)
        {
            case TYPE_CLIENT:
                d.x = width - CIRCLE_DIAMETER;
                d.y = height / 2.0;
                break;

            case TYPE_BROKER:
                d.x = width / 2.0;
                d.y = height / 2.0;
                break;

            case TYPE_NODE:
                d.x = 0.000 + CIRCLE_DIAMETER;
                d.y = height / 2.0;
                break;
        }

        return `translate(${d.x}, ${d.y})`;
    });

    nodesEnter.append('circle').attr('r', CIRCLE_DIAMETER).attr('fill', (d) => colorScheme(d.type));

    nodesEnter.append('text').attr('text-anchor', 'middle').attr('dominant-baseline', 'central').attr('class', 'indi-topology-icon').text((d) => getIconFromType(d.type));

    nodesEnter.append('text').attr('text-anchor', 'right').attr('dominant-baseline', 'central').attr('class', 'indi-topology-label').attr('x', CIRCLE_DIAMETER + 5).text((d) => d.name);

    nodesEnter.merge(nodes).call(d3.drag()
        .on('start', onDragStart)
        .on('drag', onDrag)
        .on('end', onDragEnd)
    );

    nodes.exit().remove();
};

/*--------------------------------------------------------------------------------------------------------------------*/

const init = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    width = 1.00000 * svgEl.value.clientWidth;
    height = 0.66666 * svgEl.value.clientWidth;

    svgEl.value.style.height = `${height}px`;

    /*----------------------------------------------------------------------------------------------------------------*/

    const svg = d3.select(svgEl.value);

    linkLayer = svg.select('#links-layer');
    nodeLayer = svg.select('#nodes-layer');

    /*----------------------------------------------------------------------------------------------------------------*/

    colorScheme = d3.scaleOrdinal(d3.schemeCategory10);

    /*----------------------------------------------------------------------------------------------------------------*/

    data.nodes.push({id: '0', type: TYPE_BROKER, name: 'Broker'});

    /*----------------------------------------------------------------------------------------------------------------*/

    simulation = d3.forceSimulation(data.nodes)
        .force('link', d3.forceLink(data.links).id((d) => d.id).distance(0.33 * width))
        .force('charge', d3.forceManyBody().strength(CHARGE_STRENGTH))
        .force('collide', d3.forceCollide().radius(CIRCLE_DIAMETER))
        .force('x', d3.forceX((d) => d.type === TYPE_CLIENT ? 0.75 * width
                                                            : 0.33 * width
        ))
        .force('y', d3.forceY(height / 2.0))
        .on('tick', ticked)
    ;

    /*----------------------------------------------------------------------------------------------------------------*/

    updateNodes();

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const update = (pingDict, type) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    for(const [name, timestamp] of Object.entries(pingDict))
    {
        let found = false;

        for(const node of data.nodes)
        {
            if(node.name === name)
            {
                node.timestamp = timestamp;

                found = true;

                break;
            }
        }

        /*------------------------------------------------------------------------------------------------------------*/

        if(!found)
        {
            const id = uuid.v4();

            data.nodes.push({
                id: id,
                type: type,
                name: name,
                timestamp: timestamp,
            });

            data.links.push({
                source: id,
                target: '0',
            });

            updateLinks();
            updateNodes();

            simulation.nodes(data.nodes).force('link').links(data.links);

            simulation.alpha(0.3).restart();
        }

        /*------------------------------------------------------------------------------------------------------------*/

        const now = Date.now();

        nodeLayer.selectAll('g').select('circle')
                                .filter((d) => d.type === type)
                                .classed('indi-topology-dead', (d) => {

            return now - d.timestamp > 10 * 1000;
        });

        /*------------------------------------------------------------------------------------------------------------*/
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    interval = setInterval(() => {

        update(indiStore.clientPingDict, TYPE_CLIENT);

        update(indiStore.nodePingDict, TYPE_NODE);

    }, 1000);

    init();
});

/*--------------------------------------------------------------------------------------------------------------------*/

onUnmounted(() => {

    if(interval)
    {
        clearInterval(interval);
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="card mx-auto mb-3">
        <div class="card-header px-3 py-2">
            <i class="bi bi-diagram-3"></i>
            Network
        </div>
        <div class="card-body px-0 py-0">

            <svg class="w-100" ref="svgEl">
                <g id="links-layer"></g>
                <g id="nodes-layer"></g>
            </svg>

        </div>
    </div>

</template>

<style>

/*--------------------------------------------------------------------------------------------------------------------*/

.indi-topology-link {

    stroke: #999;
    stroke-width: 2px;
    stroke-opacity: 0.6;
    stroke-dasharray: 5.5;
}

/*--------------------------------------------------------------------------------------------------------------------*/

.indi-topology-dead {

    fill: #999;
    stroke: #333;
    stroke-width: 1px;
    stroke-dasharray: 3.3;
}

/*--------------------------------------------------------------------------------------------------------------------*/

.indi-topology-icon {

    fill: var(--bs-body-color);

    font-size: 1.75000000000rem;
    font-family: bootstrap-icons;
}

/*--------------------------------------------------------------------------------------------------------------------*/

.indi-topology-label {

    fill: var(--bs-body-color);

    font-size: var(--bs-body-font-size);
    font-family: var(--bs-body-font-family);
}

/*--------------------------------------------------------------------------------------------------------------------*/
</style>
