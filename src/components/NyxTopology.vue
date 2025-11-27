<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, onMounted, onUnmounted} from 'vue';

import * as uuid from 'uuid';

import * as d3 from 'd3';

/*--------------------------------------------------------------------------------------------------------------------*/

import useNyxStore from '../stores/nyx';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const nyxStore = useNyxStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const TYPE_BROKER = 1;
const TYPE_NODE = 2;
const TYPE_SPECIAL = 3;
const TYPE_CLIENT = 4;

/*--------------------------------------------------------------------------------------------------------------------*/

const CHARGE_STRENGTH = -500;
const CIRCLE_DIAMETER = 20;

/*--------------------------------------------------------------------------------------------------------------------*/

const svgEl = ref(null);

const linkLayerEl = ref(null);
const nodeLayerEl = ref(null);

/*--------------------------------------------------------------------------------------------------------------------*/

let timer = null;
let simulation = null;

let height = 0;
let width = 0;

/*--------------------------------------------------------------------------------------------------------------------*/

const graph = {
    nodes: [],
    links: [],
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const onTick = () => {

    d3.select(linkLayerEl.value).selectAll('line').attr('x1', (d) => d.source.x)
                                                  .attr('y1', (d) => d.source.y)
                                                  .attr('x2', (d) => d.target.x)
                                                  .attr('y2', (d) => d.target.y)
    ;

    d3.select(nodeLayerEl.value).selectAll('g').attr('transform', (d) => `translate(${d.x},${d.y})`);
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

const getColorFromType = (type) => {

    switch(type)
    {
        case TYPE_BROKER:
            return '#1F77B4';
        case TYPE_NODE:
            return '#2CA02C';
        case TYPE_SPECIAL:
            return '#2CA02C';
        case TYPE_CLIENT:
            return '#2CA02C';
        default:
            return '#FFFFF';
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const getIconFromType = (type) => {

    switch(type)
    {
        case TYPE_BROKER:
            return '\uF411';
        case TYPE_NODE:
            return '\uF40D';
        case TYPE_SPECIAL:
            return '\uF685';
        case TYPE_CLIENT:
            return '\uF456';
        default:
            return '\uF50C';
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const patchName = (name) => {

    /**/ if(name === '$$nyx-stream-server$$') {
        return 'Nyx Stream Server';
    }
    else if(name === '$$nyx-indi-bridge$$') {
        return 'Nyx Indi Bridge';
    }

    return name;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const updateLinks = () => {

    const links = d3.select(linkLayerEl.value).selectAll('line').data(graph.links);

    const linksEnter = links.enter().append('line').attr('class', 'nyx-topology-link');

    linksEnter.merge(links);

    links.exit().remove();
};

/*--------------------------------------------------------------------------------------------------------------------*/

const updateNodes = () => {

    const nodes = d3.select(nodeLayerEl.value).selectAll('g').data(graph.nodes);

    const nodesEnter = nodes.enter().append('g').attr('transform', (d) => {

        switch(d.type)
        {
            case TYPE_CLIENT:
                d.x = width - CIRCLE_DIAMETER;
                d.y = 0.0;
                break;

            case TYPE_BROKER:
                d.x = width / 2.0;
                d.y = height / 2.0;
                break;

            case TYPE_NODE:
            case TYPE_SPECIAL:
                d.x = 0.000 + CIRCLE_DIAMETER;
                d.y = 0.0;
                break;
        }

        return `translate(${d.x}, ${d.y})`;
    });

    nodesEnter.append('circle').attr('r', CIRCLE_DIAMETER).attr('fill', (d) => getColorFromType(d.type));

    nodesEnter.append('text').attr('text-anchor', 'middle').attr('dominant-baseline', 'central').attr('class', 'nyx-topology-icon').text((d) => getIconFromType(d.type));

    nodesEnter.append('text').attr('text-anchor', 'right').attr('dominant-baseline', 'central').attr('class', 'nyx-topology-label').attr('x', CIRCLE_DIAMETER + 5).text((d) => patchName(d.name));

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

    timer = setInterval(() => {

        update(nyxStore.clientPingDict, TYPE_CLIENT);

        update(nyxStore.nodePingDict, TYPE_NODE);

    }, 1000);

    /*----------------------------------------------------------------------------------------------------------------*/

    graph.nodes.push({
        id: '0',
        type: TYPE_BROKER,
        name: 'MQTT broker',
        timestamp: 0x00000000,
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    window.addEventListener('resize', resize);

    /*----------------------------------------------------------------------------------------------------------------*/

    resize();

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const final = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    window.removeEventListener('resize', resize);

    /*----------------------------------------------------------------------------------------------------------------*/

    clearInterval(timer);

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const resize = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    width = 1.00000 * svgEl.value.clientWidth;
    height = 0.66666 * svgEl.value.clientWidth;

    svgEl.value.style.height = `${height}px`;

    /*----------------------------------------------------------------------------------------------------------------*/

    simulation = d3.forceSimulation(graph.nodes)
        .force('link', d3.forceLink(graph.links).id((d) => d.id).distance(0.25 * width))
        .force('charge', d3.forceManyBody().strength(CHARGE_STRENGTH))
        .force('collide', d3.forceCollide().radius(CIRCLE_DIAMETER))
        .force('x', d3.forceX((d) => d.type === TYPE_CLIENT ? 0.75 * width
                                                            : 0.33 * width
        ))
        .force('y', d3.forceY(height / 2.0))
        .on('tick', onTick)
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
        /*------------------------------------------------------------------------------------------------------------*/

        if(name.startsWith('$$nyx-'))
        {
            type = TYPE_SPECIAL;
        }

        /*------------------------------------------------------------------------------------------------------------*/

        let found = false;

        for(const node of graph.nodes)
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
            /*--------------------------------------------------------------------------------------------------------*/

            const id = uuid.v4();

            graph.nodes.push({
                id: id,
                type: type,
                name: name,
                timestamp: timestamp,
            });

            graph.links.push({
                source: id,
                target: '0',
            });

            /*--------------------------------------------------------------------------------------------------------*/

            updateLinks();

            updateNodes();

            /*--------------------------------------------------------------------------------------------------------*/

            simulation.nodes(graph.nodes).force('link').links(graph.links);

            simulation.alpha(0.3).restart();

            /*--------------------------------------------------------------------------------------------------------*/
        }

        /*------------------------------------------------------------------------------------------------------------*/

        const now = Date.now();

        d3.select(nodeLayerEl.value).selectAll('circle')
                                    .filter((d) => d.type === type)
                                    .classed('nyx-topology-dead', (d) => (now - d.timestamp) > 10 * 1000)
        ;

        /*------------------------------------------------------------------------------------------------------------*/
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    init();
});

/*--------------------------------------------------------------------------------------------------------------------*/

onUnmounted(() => {

    final();
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="card">
        <div class="card-header px-3 py-2">
            <i class="bi bi-diagram-3"></i>
            Network
        </div>
        <div class="card-body px-0 py-0">

            <svg class="w-100" ref="svgEl">
                <g ref="linkLayerEl"></g>
                <g ref="nodeLayerEl"></g>
            </svg>

        </div>
    </div>

    <!-- *********************************************************************************************************** -->

</template>

<style>
/*--------------------------------------------------------------------------------------------------------------------*/

.nyx-topology-link {

    stroke: #999;
    stroke-width: 2px;
    stroke-opacity: 0.6;
    stroke-dasharray: 5.5;
}

/*--------------------------------------------------------------------------------------------------------------------*/

.nyx-topology-dead {

    fill: #999;
    stroke: #333;
    stroke-width: 1px;
    stroke-dasharray: 3.3;
}

/*--------------------------------------------------------------------------------------------------------------------*/

.nyx-topology-icon {

    fill: var(--bs-body-color);
    font-size: 1.75000000000rem;
    font-family: bootstrap-icons;
}

/*--------------------------------------------------------------------------------------------------------------------*/

.nyx-topology-label {

    fill: var(--bs-body-color);
    font-size: 0.7500000000000000rem;
    font-family: var(--bs-body-font-family);
}

/*--------------------------------------------------------------------------------------------------------------------*/
</style>
