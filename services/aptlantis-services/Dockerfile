FROM rust:1.94-bookworm AS builder

WORKDIR /usr/src/aptlantis-services
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --release --locked

FROM debian:bookworm-slim AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /usr/src/aptlantis-services/target/release/aptlantis-services /usr/local/bin/aptlantis-services

ENV APTLANTIS_BIND=0.0.0.0:8989
ENV APTLANTIS_DATA_ROOT=/app/data
ENV APTLANTIS_SESM_ROOT=/app/sesm
ENV APTLANTIS_SESM_PYTHON=python3
EXPOSE 8989

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD /usr/local/bin/aptlantis-services --healthcheck || exit 1

CMD ["/usr/local/bin/aptlantis-services"]
