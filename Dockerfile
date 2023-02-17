FROM hyperledgerk8s/bc-apis-base:1.0.0 as builder

ENV NODE_ENV production

COPY . /usr/src/app/

RUN nr build

FROM hyperledgerk8s/bc-console:dev-branch as bc-console
FROM hyperledgerk8s/bc-apis-base-pro:1.0.0

COPY --from=builder /usr/src/app/dist /usr/src/app/dist
COPY --from=bc-console /build-files/dist /usr/src/app/public

EXPOSE 8024

CMD ["node", "dist/main"]
