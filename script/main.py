import matplotlib.pyplot as plt
import polars as pl

df = pl.read_csv("../data/2022-04-05-16-19_82-8-1-1-[1]-1.csv", skip_rows=3)
LT_CONTACT = "Noraxon MyoMotion-Segments-Foot LT-Contact"
RT_CONTACT = "Noraxon MyoMotion-Segments-Foot RT-Contact"
DOUBLE_SUPPORT = "double_support"
SINGLE_SUPPORT = "single_support"
L_SINGLE_SUPPORT = "l_single_support"
R_SINGLE_SUPPORT = "r_single_support"

df = (
    df.lazy()
    .with_columns(
        [
            pl.when(pl.col(LT_CONTACT) == 1000)
            .then(pl.lit(True))
            .otherwise(pl.lit(False))
            .alias(LT_CONTACT),
            pl.when(pl.col(RT_CONTACT) == 1000)
            .then(pl.lit(True))
            .otherwise(pl.lit(False))
            .alias(RT_CONTACT),
        ]
    )
    .with_column((pl.col(LT_CONTACT) & pl.col(RT_CONTACT)).alias(DOUBLE_SUPPORT))
    .with_column(pl.col(DOUBLE_SUPPORT).is_not().alias(SINGLE_SUPPORT))
    .with_columns(
        [
            (pl.col(LT_CONTACT) & pl.col(SINGLE_SUPPORT)).alias(L_SINGLE_SUPPORT),
            (pl.col(RT_CONTACT) & pl.col(SINGLE_SUPPORT)).alias(R_SINGLE_SUPPORT),
        ]
    )
    .collect()
)

df = df.to_pandas()

fig, ax = plt.subplots(figsize=(16,3))
df[[LT_CONTACT, RT_CONTACT]].astype(int).plot(linewidth=0.2, ax=ax)
ax.fill_between(df.index, df[LT_CONTACT].astype(int), alpha=0.2) # pyright: ignore
ax.fill_between(df.index, df[RT_CONTACT].astype(int), alpha=0.2) # pyright: ignore
plt.show()
