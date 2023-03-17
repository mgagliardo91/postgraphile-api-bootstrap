import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
  GraphQLServiceContext,
} from 'apollo-server-core'
import { ApolloServerPlugin, BaseContext } from 'apollo-server-plugin-base'
import type Express from 'express'

import { ENABLE_PLAYGROUND } from '../env'

const getLandingPageHtml = async (
  landingPage: ApolloServerPlugin<BaseContext>,
): Promise<string> => {
  const mockContext = {} as GraphQLServiceContext
  if (landingPage.serverWillStart) {
    const render = await landingPage.serverWillStart(mockContext)

    if (render?.renderLandingPage) {
      const { html } = await render.renderLandingPage()
      return html
    }
  }

  return ''
}

const createLandingPage = async (app: Express.Application) => {
  const landingPage = ENABLE_PLAYGROUND
    ? ApolloServerPluginLandingPageLocalDefault({
        footer: false,
        embed: true,
        includeCookies: true,
      })
    : ApolloServerPluginLandingPageProductionDefault({
        footer: false,
        includeCookies: true,
      })
  const html = await getLandingPageHtml(landingPage)
  app.get('/graphql', (_, res) => {
    res.send(html)
  })
}

export default createLandingPage
