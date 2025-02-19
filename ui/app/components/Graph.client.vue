<script setup lang="ts">
import type { Graph } from '~~/types/graph'
import type { PkgMeta } from '~~/types/pkg'
import { useDebounceFn } from '@vueuse/core'
import chroma from 'chroma-js'
import { Network } from 'vis-network'

const networkRef = useTemplateRef('networkRef')

const { webcontainerInstance } = useWebcontainerStore()
const { status } = storeToRefs(useWebcontainerStore())
let network: Network | null = null

const { name, pkg } = usePkgName()
const pkgMetaData = ref<PkgMeta>()

const visData = await webcontainerInstance?.fs.readFile('./visData.json', 'utf-8')
const parsedData = JSON.parse(visData!) as Graph

const pkgLockRaw = await webcontainerInstance?.fs.readFile('./package-lock.json', 'utf-8')
const pkgLock = JSON.parse(pkgLockRaw!)

const contributorMap = new Map()

async function getNestedPkgInfo(pkg: string) {
  const packages = pkgLock.packages

  const findPkgPath = Object.keys(packages).find(key => key.includes(`/${pkg}`))
  if (findPkgPath) {
    const pkgInfo = await webcontainerInstance?.fs.readFile(`${findPkgPath}/package.json`, 'utf-8')
    return pkgInfo || ''
  }

  return ''
}

async function getPkgInfo(pkg: string) {
  let pkgInfo = '';
  try {
    const _pkgInfo = await webcontainerInstance?.fs.readFile(
      `./node_modules/${pkg}/package.json`,
      'utf-8'
    );
    if (_pkgInfo)
      pkgInfo = _pkgInfo
  }
  catch {
    // Nested dependency
    pkgInfo = await getNestedPkgInfo(pkg)
  }

  pkgMetaData.value = JSON.parse(pkgInfo) as PkgMeta
}

async function getAnyPkgInfo(pkg: string) {
  let pkgInfo = '';
  try {
    const _pkgInfo = await webcontainerInstance?.fs.readFile(
      `./node_modules/${pkg}/package.json`,
      'utf-8'
    );
    if (_pkgInfo)
      pkgInfo = _pkgInfo
  }
  catch {
    // Nested dependency
    pkgInfo = await getNestedPkgInfo(pkg)
  }

  return JSON.parse(pkgInfo) as PkgMeta
}

const hostname = window.location.hostname
const len = parsedData.nodes.length
for (let i = 0; i < len; i++) {
  const node = parsedData.nodes[i]
  const pkg = node.label
  const pkgInfo = await getAnyPkgInfo(pkg)
  let githubUrl = ''
  if (pkgInfo?.repository) {
    if (typeof pkgInfo.repository === 'string') {
      githubUrl = `https://github.com/${pkgInfo.repository}`
    }
    else {
      githubUrl = pkgInfo.repository.url?.replace('git+https://github.com/', 'https://github.com/').replace('git://github.com', 'https://github.com')
    }
  }

  if (githubUrl) {
    try {
      const response = await fetch(`http://${hostname}:5099/api/github/contributors?githubUrl=${encodeURIComponent(githubUrl)}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const { success, data } = await response.json()
      if (success) {
        const contributionsMap = new Map()
        const contributorNodes = data.map((contributor) => {
          const id = `contributor ${contributor.login}`
          if (!contributorMap.has(id)) {
            contributorMap.set(id, {
              id,
              label: id,
              level: node.level + 1,
            })
            parsedData.nodes.push(contributorMap.get(id))
          }
          contributionsMap.set(id, contributor.contributions)
          return contributorMap.get(id)
        })

        contributorNodes.forEach((contributorNode) => {
          parsedData.edges.push({
            from: node.id,
            to: contributorNode.id,
            value: contributionsMap.get(contributorNode.id)*150/100,
          })
        })
      }
    }
    catch (error) {
      console.error('Failed to fetch contributors:', error)
    }
  }
}

function getNodeColor(level: number, opacity = 1, id?: string) {
  if (id?.startsWith('contributor '))
    return '#87ceeb'

  const colors = [
    '#15803d',
    '#6d28d9',
    '#0369a1',
    '#374151',
  ]
  const colorIndex = Math.min(level, colors.length - 1)
  const baseColor = chroma(colors[colorIndex]!)

  const [_l, c, h] = baseColor.oklch()

  return chroma.oklch(0.7, c, h).mix('#ffff', 1 - opacity).hex()
}

function getEdgeColor(value: number, maxValue: number) {

  if (value === 0)
    return '#e5e7eb'

  const colors = [
    '#fef3c7',
    '#fde68a',
    '#fcd34d',
    '#fbbf24',
    '#f59e0b'
  ]
  
  const index = maxValue === 0 
    ? 0 
    : Math.min(Math.floor((value / maxValue) * colors.length), colors.length - 1)
  return colors[index]
}

const loading = ref(false)
const level = ref(Math.min(parsedData.maxLevel, 3))
const showContributors = ref(true)

function getNodes(_level: number): any {
  return parsedData.nodes
    .filter(node => {
      if (!showContributors.value && node.id?.startsWith('contributor ')) {
        return false
      }
      return node.level! <= _level
    })
    .map((node) => {
      return {
        ...node,
        color: {
          background: getNodeColor(node.level!, 0.3, node.id),
          border: getNodeColor(node.level!, 0.8, node.id),
        },
        shape: 'box',
        font: {
          size: node.id?.startsWith('contributor ') ? 12 : node.level === 0 ? 51 : node.level === 1 ? 21 : 16,
          face: 'arial',
          color: node.level === 0 ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.8)',
        },
        borderWidth: node.level === 0 ? 2 : 1,
        margin: 12,
        fixed: node.level === 0,
        x: node.level === 0 ? 0 : undefined,
        y: node.level === 0 ? 0 : undefined,
        shapeProperties: { borderDashes: node.level! < 2 ? [0, 0] : [2, 2] },
      }
    })
}

watch([level, showContributors], async ([value]) => {
  try {
    loading.value = true
    const nodes = getNodes(value)
    const filteredEdges = parsedData.edges.filter(edge =>
      nodes.some((node: any) => node.id === edge.from)
      && nodes.some((node: any) => node.id === edge.to),
    )

    const maxEdgeValue = Math.max(...filteredEdges.map(edge => edge.value || 0))

    network?.setData({ 
      nodes, 
      edges: filteredEdges.map(edge => ({
        ...edge,
        maxValue: maxEdgeValue,
        color: getEdgeColor(edge.value || 0, maxEdgeValue),
      })) 
    })

    network?.setOptions({ physics: true })

    await new Promise(resolve => setTimeout(resolve, 1000))
    network?.stabilize()

    await new Promise(resolve => setTimeout(resolve, 1000))

    network?.setOptions({ physics: false })
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loading.value = false
  }
})

function moveNetwork(direction: 'left' | 'right' | 'up' | 'down') {
  const currentPosition = network?.getViewPosition()
  const moveDistance = 100

  if (currentPosition) {
    let newX = currentPosition.x
    let newY = currentPosition.y

    switch (direction) {
      case 'left':
        newX -= moveDistance
        break
      case 'right':
        newX += moveDistance
        break
      case 'up':
        newY -= moveDistance
        break
      case 'down':
        newY += moveDistance
        break
    }

    network?.moveTo({
      position: { x: newX, y: newY },
      animation: {
        duration: 500,
        easingFunction: 'easeInOutQuad',
      },
    })
  }
}

function zoomNetwork(zoomIn: boolean) {
  const currentScale = network?.getScale() || 1
  const zoomFactor = 1.5

  const newScale = zoomIn ? currentScale * zoomFactor : currentScale / zoomFactor

  network?.moveTo({
    scale: newScale,
    animation: {
      duration: 500,
      easingFunction: 'easeInOutQuad',
    },
  })
}

function focus() {
  network?.focus(name, {
    scale: 0.7,
    animation: {
      duration: 1000,
      easingFunction: 'easeInOutQuad',
    },
  })
}

let imageHref = ''

function saveImage() {
  const link = document.createElement('a')
  link.href = imageHref
  link.download = `${pkg}-dependency-graph.png`
  link.click()
}

onMounted(async () => {
  const nodes = getNodes(level.value)
  const initialEdges = parsedData.edges
  const maxEdgeValue = Math.max(...initialEdges.map(edge => edge.value || 0))

  network = new Network(networkRef.value!, { 
    nodes, 
    edges: initialEdges.map(edge => ({
      ...edge,
      maxValue: maxEdgeValue,
      color: getEdgeColor(edge.value || 0, maxEdgeValue),
      hoverWidth: 0,
    })),
  }, {
    nodes: {
      labelHighlightBold: false,
      shape: 'box',
      borderWidth: 0,
      color: {
        highlight: '#4ade80',
      },
    },
    edges: {
      smooth: {
        enabled: true,
        type: 'cubicBezier',
        roundness: 0.5,
      },
      width: 1,
      color: {
        inherit: false,
        highlight: '#4ade80',
      },
      hoverWidth: 0,
      arrows: {
        to: {
          enabled: true,
          type: 'arrow',
        },
      },
    },
    physics: {
      enabled: true,
      barnesHut: {
        gravitationalConstant: -15000,
        centralGravity: 0.7,
        springLength: 250,
        springConstant: 0.05,
        damping: 0.09,
        avoidOverlap: 1,
      },
      stabilization: {
        enabled: true,
        iterations: 2000,
        updateInterval: 50,
        onlyDynamicEdges: false,
        fit: true,
      },
    },
  })

  network?.on('stabilizationIterationsDone', () => {
    network?.setOptions({ physics: false })
    focus()

    status.value = 'finish'

    getPkgInfo(name)
  })

  network?.on('selectNode', (params) => {
    getPkgInfo(params.nodes[0])
  })

  network?.on('deselectNode', () => {
    getPkgInfo(name)
  })

  network.on('afterDrawing', useDebounceFn((ctx) => {
    imageHref = ctx.canvas.toDataURL('image/png')
  }, 1000))
})

onUnmounted(() => {
  network?.destroy()
  network = null
})

const { isOpen } = storeToRefs(useSlide())
</script>

<template>
  <div class="flex m-4 gap-4">
    <div class="w-[33vw] hidden md:block">
      <PkgMeta
        v-model:level="level"
        :max-level="parsedData.maxLevel"
        :meta="pkgMetaData"
        @save-image="saveImage"
        class="w-full"
      />
    </div>

    <USlideover 
      v-model="isOpen" 
      class="md:hidden block" 
      side="left"
      :width="'33vw'"
    >
      <div class="m-4 w-full">
        <PkgMeta
          v-model:level="level"
          :max-level="parsedData.maxLevel"
          :meta="pkgMetaData"
          @save-image="saveImage"
          class="w-full"
        />
      </div>
    </USlideover>

    <UCard
      :ui="{
        body: {
          base: 'rounded-lg',
          background: 'bg-gray-50 dark:bg-gray-900',
          padding: 'p-2 sm:p-2',
        },
      }" 
      class="w-[66vw] h-[calc(100vh-6rem)] relative ml-auto"
    >
      <div ref="networkRef" class="h-[calc(100vh-7rem)] w-full" :class="loading ? 'opacity-0' : ''" />

      <div class="absolute left-4 bottom-4">
        <UButton
          icon="i-heroicons-user-group"
          :color="showContributors ? 'primary' : 'gray'"
          variant="soft"
          @click="() => {
            showContributors = !showContributors
            const currentLevel = level.value
            level.value = currentLevel + 1
            setTimeout(() => {
              level.value = currentLevel
            }, 0)
          }"
        >
          {{ showContributors ? 'Hide' : 'Show' }} Contributors
        </UButton>
      </div>

      <div class="absolute right-4 bottom-4">
        <GraphActions
          @move="moveNetwork"
          @zoom="zoomNetwork"
          @focus="focus"
        />
      </div>

      <Overlay :open="loading">
        <div class="flex items-center justify-center h-full">
          <UIcon name="i-eos-icons:loading" class="w-8 h-8 text-gray" />
        </div>
      </Overlay>
    </UCard>
  </div>
</template>
