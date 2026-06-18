<template>
  <main class="app-shell">
    <section class="hero">
      <div class="hero-field" aria-hidden="true">
        <span class="center-circle"></span>
        <span class="penalty-box left"></span>
        <span class="penalty-box right"></span>
      </div>
      <div class="hero-content">
        <p class="eyebrow">World Cup Upset Lab</p>
        <h1>世界杯冷门生成器</h1>
        <p>
          选择强队与弱队，调整比赛变量，用透明规则和 10000 场蒙特卡洛模拟观察冷门概率、比分分布和爆冷路径。
        </p>
      </div>
    </section>

    <section class="workspace">
      <div class="setup-column">
        <section class="panel selector-panel" aria-labelledby="selector-title">
          <div class="section-head">
            <div>
              <p class="eyebrow">Teams</p>
              <h2 id="selector-title">对阵设置</h2>
            </div>
            <span class="meta">2026 · 48 队</span>
          </div>

          <FixtureSelector
            :model-value="selectedFixtureId"
            :fixtures="groupFixtures"
            :teams="teams"
            @update:model-value="applyFixture"
          />

          <div class="selectors">
            <TeamSelector
              v-model="strongTeamId"
              label="强队"
              :teams="teams"
              :exclude-id="weakTeamId"
            />
            <TeamSelector
              v-model="weakTeamId"
              label="弱队"
              :teams="teams"
              :exclude-id="strongTeamId"
            />
          </div>

          <div class="match-card">
            <div>
              <span>{{ strongTeam.countryCode }}</span>
              <strong>{{ strongTeam.name }}</strong>
              <small>实力 {{ strongTeam.strength }} · 攻 {{ strongTeam.attack }} · 防 {{ strongTeam.defense }}</small>
            </div>
            <b>VS</b>
            <div>
              <span>{{ weakTeam.countryCode }}</span>
              <strong>{{ weakTeam.name }}</strong>
              <small>实力 {{ weakTeam.strength }} · 攻 {{ weakTeam.attack }} · 防 {{ weakTeam.defense }}</small>
            </div>
          </div>

          <p class="notice">参赛队名单采用 2026 世界杯阵容；能力值为机制演示参数，不代表官方评级或真实预测。</p>
        </section>

        <FactorPanel :factors="factors" @update:factor="setFactor" @reset="resetFactors" />
      </div>

      <div class="results-column">
        <section class="simulate-band">
          <div>
            <p class="eyebrow">Monte Carlo</p>
            <h2>运行 10000 场模拟</h2>
            <p>每次点击都会基于当前参数重新抽样，概率会有轻微波动。</p>
          </div>
          <button class="primary-button" type="button" @click="run()">模拟 10000 场</button>
        </section>

        <template v-if="result">
          <ProbabilityResult :result="result" />
          <ShareActions
            :strong-team="strongTeam"
            :weak-team="weakTeam"
            :factors="factors"
            :result="result"
          />
          <div class="analysis-grid">
            <ScoreDistribution :result="result" />
            <FactorContribution :result="result" />
          </div>
          <ExplanationCard :result="result" />
        </template>

        <section v-else class="empty-state">
          <strong>等待模拟</strong>
          <p>调整左侧变量后点击按钮，系统会输出概率、比分分布和冷门路径。</p>
        </section>

        <section class="model-note">
          <h2>模型说明</h2>
          <p>
            引擎先根据双方攻防、稳定性和实力差生成基础预期进球，再由战术克制、防守执行、定位球、门将、体能、轻敌和扰动风险修正 xG。
            每场比赛用泊松分布抽样进球数，并统计胜平负与比分频率。模型用于解释机制和交互体验，不用于真实投注或赛事预测。
          </p>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import ExplanationCard from './components/ExplanationCard.vue'
import FactorContribution from './components/FactorContribution.vue'
import FactorPanel from './components/FactorPanel.vue'
import FixtureSelector from './components/FixtureSelector.vue'
import ProbabilityResult from './components/ProbabilityResult.vue'
import ScoreDistribution from './components/ScoreDistribution.vue'
import ShareActions from './components/ShareActions.vue'
import TeamSelector from './components/TeamSelector.vue'
import { useSimulation } from './composables/useSimulation'

const {
  teams,
  strongTeamId,
  weakTeamId,
  strongTeam,
  weakTeam,
  groupFixtures,
  selectedFixtureId,
  factors,
  result,
  setFactor,
  run,
  resetFactors,
  applyFixture,
} = useSimulation()
</script>
