import type { MatchFactors, SimulationResult, Team } from '../types/match'
import { formatPercent } from './format'

export interface ShareCardInput {
  strongTeam: Team
  weakTeam: Team
  factors: MatchFactors
  result: SimulationResult
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string,
) {
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
  context.fillStyle = fill
  context.fill()
}

function drawMetric(
  context: CanvasRenderingContext2D,
  x: number,
  label: string,
  value: string,
  color: string,
) {
  roundedRect(context, x, 282, 310, 142, 14, color)
  context.fillStyle = 'rgba(255,255,255,.76)'
  context.font = '600 24px "Microsoft YaHei", sans-serif'
  context.fillText(label, x + 26, 322)
  context.fillStyle = '#ffffff'
  context.font = '900 58px "Microsoft YaHei", sans-serif'
  context.fillText(value, x + 26, 392)
}

export async function createShareCard(input: ShareCardInput): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 630
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is not supported')

  const { strongTeam, weakTeam, result } = input
  const background = context.createLinearGradient(0, 0, 1200, 630)
  background.addColorStop(0, '#0b3d24')
  background.addColorStop(0.65, '#14532d')
  background.addColorStop(1, '#17231c')
  context.fillStyle = background
  context.fillRect(0, 0, 1200, 630)

  context.strokeStyle = 'rgba(255,255,255,.14)'
  context.lineWidth = 3
  context.strokeRect(28, 28, 1144, 574)
  context.beginPath()
  context.arc(600, 315, 104, 0, Math.PI * 2)
  context.stroke()
  context.beginPath()
  context.moveTo(600, 28)
  context.lineTo(600, 602)
  context.stroke()

  context.fillStyle = '#f2c14e'
  context.font = '800 22px "Microsoft YaHei", sans-serif'
  context.fillText('WORLD CUP UPSET LAB', 72, 84)

  context.fillStyle = '#ffffff'
  context.font = '900 48px "Microsoft YaHei", sans-serif'
  context.fillText(`${strongTeam.name}  VS  ${weakTeam.name}`, 72, 154)
  context.fillStyle = 'rgba(255,255,255,.7)'
  context.font = '500 22px "Microsoft YaHei", sans-serif'
  context.fillText(`模拟 ${result.simulations.toLocaleString('zh-CN')} 场 · 最常见比分 ${result.topScores[0]?.score ?? '-'}`, 72, 198)

  drawMetric(context, 72, '强队获胜', formatPercent(result.strongTeamWinRate), '#172334')
  drawMetric(context, 445, '平局', formatPercent(result.drawRate), '#805313')
  drawMetric(context, 818, '弱队冷门获胜', formatPercent(result.upsetRate), '#b13b2c')

  const drivers = result.factorContributions
    .filter((item) => item.contribution > 0)
    .slice(0, 3)
    .map((item) => item.factor)
    .join(' · ')

  context.fillStyle = '#f2c14e'
  context.font = '800 20px "Microsoft YaHei", sans-serif'
  context.fillText('主要冷门路径', 72, 490)
  context.fillStyle = '#ffffff'
  context.font = '600 26px "Microsoft YaHei", sans-serif'
  context.fillText(drivers || '低比分 · 定位球 · 防守韧性', 72, 532)
  context.fillStyle = 'rgba(255,255,255,.58)'
  context.font = '400 18px "Microsoft YaHei", sans-serif'
  context.fillText('机制演示，不代表官方评级、真实预测或投注建议', 72, 576)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to create share image'))
    }, 'image/png')
  })
}
